import { DatabaseType } from ".";
import { ConnectionOptions, Connector } from "./orm/connectors";
import {
  CassandraConnectionOptions,
  CassandraConnector,
} from "./orm/connectors/cassandra/cassandra";
import { MongoConnectionOptions, MongoConnector } from "./orm/connectors/mongodb/mongodb";

export class ConnectorFactory {
  public create(type: DatabaseType, options: ConnectionOptions, secret: string): Connector {
    switch (type) {
      case "cassandra":
        return new CassandraConnector(type, options as CassandraConnectionOptions, secret);
      case "mongodb":
        return new MongoConnector(type, options as MongoConnectionOptions, secret);
      default:
        throw new Error(`${type} is not supported`);
    }
  }
}
