# Tdrive - Drive for the Twake Workplace

## Run it in development mode

1. Launch mongo using `docker run -p 27017:27017 -d mongo`
2. Launch frontend with `cd tdrive/frontend/; yarn dev:start`
3. Launch backend with `cd tdrive/backend/node/; SEARCH_DRIVER=mongodb DB_DRIVER=mongodb PUBSUB_TYPE=local DB_MONGO_URI=mongodb://localhost:27017 STORAGE_LOCAL_PATH=/[full-path-to-store-documents]/documents NODE_ENV=development yarn dev`
4. If you need more parameters, create/edit `tdrive/backend/node/config/development.json` file

App will be running on port 3000.

## License

Tdrive is licensed under [Affero GPL v3 with additional terms](https://github.com/TwakeApp/Twake/blob/main/LICENSE.md)
