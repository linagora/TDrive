import { getLogger, TdriveLogger, TdriveService } from "../../framework";
import EmailPusherAPI from "./provider";
import {
  EmailBuilderDataPayload,
  EmailBuilderRenderedResult,
  EmailBuilderTemplateName,
  EmailPusherEmailType,
  EmailPusherPayload,
  EmailPusherResponseType,
} from "./types";
import * as Eta from "eta";
import { convert } from "html-to-text";
import path from "path";
import { existsSync } from "fs";
import axios from "axios";

export default class EmailPusherClass
  extends TdriveService<EmailPusherAPI>
  implements EmailPusherAPI
{
  readonly name = "email-pusher";
  readonly version: "1.0.0";
  logger: TdriveLogger = getLogger("email-pusher-service");
  apiKey: string;
  apiUrl: string;
  sender: string;

  api(): EmailPusherAPI {
    return this;
  }

  async doInit(): Promise<this> {
    Eta.configure({
      views: path.join(__dirname, "templates"),
    });

    this.apiUrl = this.configuration.get<string>("endpoint", "");
    this.apiKey = this.configuration.get<string>("api_key", "");
    this.sender = this.configuration.get<string>("sender", "");

    return this;
  }

  /**
   * Generate a rendered HTML and text email
   *
   * @param {EmailBuilderTemplateName} template - the Eta template name
   * @param {String} language - the template language
   * @param {EmailBuilderDataPayload} data - the data
   * @returns {EmailBuilderRenderedResult} - the rendered html and text version
   */
  async build(
    template: EmailBuilderTemplateName,
    language: string,
    data: EmailBuilderDataPayload,
  ): Promise<EmailBuilderRenderedResult> {
    try {
      language = ["en", "fr"].find(l => language.toLocaleLowerCase().includes(l)) || "en";
      const templatePath = path.join(__dirname, "templates", language, `${template}.eta`);
      const subjectPath = path.join(__dirname, "templates", language, `${template}.subject.eta`);

      if (!existsSync(templatePath)) {
        throw Error(`template not found: ${templatePath}`);
      }

      if (!existsSync(subjectPath)) {
        throw Error(`subject template not found: ${subjectPath}`);
      }

      const html = await Eta.renderFile(templatePath, data);

      if (!html || !html.length) {
        throw Error("Failed to render template");
      }

      const text = convert(html);

      const subject = convert((await Eta.renderFile(subjectPath, data)) as string);

      return { html, text, subject };
    } catch (error) {
      this.logger.error(`Failure when building email template: ${error}`);
    }
  }

  /**
   * Send email
   *
   * @param {string} to - the recipient
   * @param {EmailPusherPayload} email - the email object
   * @returns {Promise<void>}
   */
  async send(
    to: string,
    { subject, html: html_body, text: text_body }: EmailPusherPayload,
  ): Promise<void> {
    try {
      if (!html_body || !text_body || !subject || !to) {
        throw Error("invalid email");
      }

      const emailObject = {
        api_key: this.apiKey,
        to: [to],
        subject,
        text_body,
        html_body,
        sender: this.sender,
      };

      const { data } = await axios.post<EmailPusherEmailType, EmailPusherResponseType>(
        `${this.apiUrl}`,
        emailObject,
      );

      if (data.error && data.error.length) {
        throw Error(data.error);
      }

      if (data.failed === 1 && data.failures.length) {
        throw Error(data.failures.join(""));
      }

      if (data.succeeded) {
        this.logger.info("email sent");
      }
    } catch (error) {
      this.logger.error("Failed to send email", error);
    }
  }
}
