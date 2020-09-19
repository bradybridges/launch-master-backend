// Update with your config settings.

module.exports = {
  development: {
    client: "pg",
    connection: "postgres://localhost/launchmaster",
    migrations: {
      directory: "./db/migrations",
    },
    useNullAsDefault: true,
  },

  staging: {
    client: "pg",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    migrations: {
      directory: "./db/migrations",
    },
  },

  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    useNullAsDefault: true,
    migrations: {
      directory: "./db/migrations",
    },
  },
};
