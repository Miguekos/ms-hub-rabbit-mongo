module.exports = {
    apps: [{
        name: "template",
        script: "./app.js",
        instances: 1,
        exec_mode: "cluster",
        watch: false,
        log_file: "~/.pm2/logs/template-outerr.log",
        out_file: "NULL", // ~/.pm2/logs/template-out.log
        error_file: "~/.pm2/logs/template-error.log",
        combine_logs: true,
        merge_logs: true,
        env_production: {
            NODE_ENV: "production",
            NODE_PATH: "./"
        },
        env_development: {
            NODE_ENV: "development",
            NODE_PATH: "./"
        }
    }]
};