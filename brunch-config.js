exports.config = {
  paths: {
    watched: ['app']
  },
  files: {
    javascripts: {
      joinTo: {
        'javascripts/vendor.js': /^bower_components/,
        'javascripts/app.js': /^app/
      },
      order: {
        before: [
          'bower_components/jquery/dist/jquery.js'
        ]
      }
    },
    stylesheets: {
      joinTo: 'stylesheets/app.css'
    },
    templates: {
      joinTo: {
        'javascripts/tpl.js': /^app\/modules\//
      }
    }
  },
  npm: {
    enabled: false
  },
  server: {
    hostname: '0.0.0.0',
    port: 3000,
    run: true
  },
  plugins: {
    html2js: {
      options: {
        base: 'app/modules',
        htmlmin: {
          removeComments: true
        }
      }
    },
    stylus: {
      includeCss: true,
      plugins: ['rupture']
    },
  },
  overrides: {
    production: {
      sourceMaps: true
    }
  }
};
