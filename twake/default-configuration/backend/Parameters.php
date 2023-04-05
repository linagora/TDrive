<?php

namespace Configuration;

class Parameters extends \Common\Configuration
{

    public $configuration = [];

    public function __construct()
    {
        $this->configuration = [
            "env" => [
              "type"  =>  "prod",
              "timer" => false,
              "admin_api_token" => "",
              "licence_key" => "",
              "standalone" => true,
              //"frontend_server_name" => "http://localhost:8000/", // define only if needed
              "server_name" => "http://localhost:8000/",
              "internal_server_name" => "http://nginx/"
            ],
            "jwt" => [
              "secret" => "supersecret",
              "expiration" => 60*60, //1 hour
              "refresh_expiration" => 60*60*24*31 //1 month
            ],
            "node" => [
                "api" => "http://node:3000/private/",
                "secret" => "api_supersecret"
            ],
            "db" => [
                "driver" => "pdo_cassandra",
                "host" => "scylladb",
                "port" => 9042,
                "dbname" => "tdrive",
                "user" => "root",
                "password" => "root",
                "encryption_key" => "ab63bb3e90c0271c9a1c06651a7c0967eab8851a7a897766",
                "replication" => "{'class': 'SimpleStrategy', 'replication_factor': '1'}"
            ],
            "es" => [
              "host" => false
            ],
            "queues" => [
                "rabbitmq" => [
                    "use" => true,
                    "host" => "rabbitmq",
                    "port" => 5672,
                    "username" => "guest",
                    "password" => "guest",
                    "vhost" => false
                ]
            ],
            "storage" => [
              "drive_previews_tmp_folder" => "/tmp/",
              "drive_tmp_folder" => "/tmp/",
              "drive_salt" => "SecretPassword",
              "providers" => [
                [
                    "label" => "someOpenStack",
                    "type" => "openstack",
                    "use" => false,
                    "project_id" => "",
                    "auth_url" => "https//auth.cloud.ovh.net/v3",
                    "buckets_prefix" => "",
                    "disable_encryption" => false,
                    "buckets" => [
                        "fr" => [
                            "public" => "",
                            "private" => "",
                            "region" => "SBG5"
                        ]
                    ],
                    "user" => [
                        "id" => "",
                        "password" => "",
                        "domain_name" => "default"
                    ]
                ],
                [
                    "label" => "someS3",
                    "type" => "S3",
                    "base_url" => "http://127.0.0.1:9000",
                    "use" => false,
                    "version" => "latest",
                    "disable_encryption" => false,
                    "buckets_prefix" => "dev.",
                    "buckets" => [
                        "fr" => "eu-west-3"
                    ],
                    "credentials" => [
                        "key" => "",
                        "secret" => ""
                    ]
                ],
                [
                    "label" => "someLocal",
                    "type" => "local",
                    "use" => true,
                    "disable_encryption" => false,
                    "location" => "../drive/",
                    "preview_location" => "../web/medias/",
                    "preview_public_path" => "/medias/"
                ],
              ],
            ],
            "mail" => [
                "sender" => [
                    "host" => "",
                    "port" => "",
                    "username" => "",
                    "password" => "",
                    "auth_mode" => "plain"
                ],
                "template_dir" => "/src/Tdrive/Core/Resources/views/",
                "tdrive_domain_url" => "https://tdriveapp.com/",
                "from" => "noreply@tdriveapp.com",
                "from_name" => "Tdrive",
                "tdrive_address" => "Tdrive, 54000 Nancy, France",
                "dkim" => [
                    "private_key" => "",
                    "domain_name" => '',
                    "selector" => ''
                ],
                "mailjet"=> [
                  "contact_list_subscribe"=> false,
                  "contact_list_newsletter"=> false
                ]
            ],
            "push_notifications" => [
                "apns_certificate" => __DIR__ . "/certs/apns_prod.pem",
                "firebase_api_key" => "KEY",
            ],

            //Defaults values for all clients but editable in database
            "defaults" => [
              "applications" => [
                "tdrive_drive" => [ "default" => true ], //False to not install
                "tdrive_calendar" => [ "default" => true ],
                "tdrive_tasks" => [ "default" => true ],
                "connectors" => [
                  "jitsi" => [ "default" => true ],
                ]
              ],
              "connectors" => [
              ],
              "branding" => [
                "name" => "Tdrive",
                "enable_newsletter" => false,
                /*
                "header" => [
                  "logo" => 'https://openpaas.linagora.com/images/white-logo.svg',
                  "apps" => [
                    [
                      "name"=> 'Accueil',
                      "url"=> 'https://openpaas.linagora.com/',
                      "icon"=> 'https://openpaas.linagora.com/images/application-menu/home-icon.svg',
                    ],
                    [
                      "name"=> 'Inbox',
                      "url"=> 'https://openpaas.linagora.com/#/unifiedinbox/inbox',
                      "icon"=> 'https://openpaas.linagora.com/unifiedinbox/images/inbox-icon.svg',
                    ],
                    [
                      "name"=> 'Calendrier',
                      "url"=> 'https://openpaas.linagora.com/#/calendar',
                      "icon"=> 'https://openpaas.linagora.com/calendar/images/calendar-icon.svg',
                    ],
                    [
                      "name"=> 'Contacts',
                      "url"=> 'https://openpaas.linagora.com/#/contact/addressbooks/',
                      "icon"=> 'https://openpaas.linagora.com/contact/images/contacts-icon.svg',
                    ],
                  ],
                ],
                "style" => [
                  "color" => '#2196F3',
                  "default_border_radius" => '2',
                ],
                "link" => "https://open-paas.org/",
                "logo" => "https://open-paas.org/wp-content/uploads/2019/10/openpaas.png"
                */
              ],
              "auth" => [
                  "internal" => [
                      "use" => true,
                      "disable_account_creation" => false,
                      "disable_email_verification" => true
                  ],
                  "openid" => [
                      "use" => false,
                      "provider_uri" => 'https://auth0.com',
                      "client_id" => '',
                      "client_secret" => '',
                      //"disable_logout_redirect" => false
                      "provider_config" => [
                        //token_endpoint
                        //token_endpoint_auth_methods_supported
                        //userinfo_endpoint
                        //end_session_endpoint
                        //authorization_endpoint
                      ]
                  ],
                  "cas" => [
                      "use" => false,
                      "base_url" => '',
                      "email_key" => '',
                      "lastname_key" => '',
                      "firstname_key" => ''
                  ],
                  "console" => [
                    "use" => false
                  ]
              ]
            ],
        ];
    }

}
