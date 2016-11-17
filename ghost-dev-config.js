var path = require('path'),
  config;

config = {
  development: {
    url: 'http://localhost:2368',
    mail: {
        transport: 'SMTP',
        options: {
            service: 'Mailgun',
            auth: {
                user: 'postmaster@jakewiesler.com',
                pass: '059e47e2f26391003e4346ecf853f70f'
            }
        }
    },

    database: {
      client: 'sqlite3',
      connection: {
        filename: path.join(__dirname, 'node_modules/ghost/content/data/ghost-dev.db')
      },
      debug: false
    },
    server: {
      host: '127.0.0.1',
      port: '2368'
    },
    paths: {
      contentPath: path.join(__dirname, 'node_modules/ghost/content/')
    }
  }
};

// Export config
module.exports = config;
