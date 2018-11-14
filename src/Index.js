const Sequelize = require('sequelize');
const Result = require('./entities/Result.js');
const Step = require('./entities/Step.js');
const TestCase = require('./entities/TestCase.js');
const Scenario = require('./entities/Scenario.js');

console.log('Loading parameters...');
const params = {
    db_host: process.env.DB_HOST || "localhost",
    db_name: process.env.DB_NAME || "gjallarhorn",
    db_user: process.env.DB_USER || "postgres",
    db_password: process.env.DB_PASSWORD || "postgres",
    db_dialect: process.env.DB_DIALECT || "postgres",
    report_file: process.env.REPORT_FILE || "cucumber_report.json"
};

console.log('Parameters were loaded successfully.');
console.log('Initiating connection to the database...');
const sequelize = new Sequelize(params.db_name, params.db_user, params.db_password, {
    host: params.db_host,
    dialect: params.db_dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false,
    define: {
        underscored: true,
        timestamps: false,
        paranoid: true,
        freezeTableName: true
    }
});
sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
        let ScenarioDAO = sequelize.define('scenario', Scenario);
        let TestCaseDAO = sequelize.define('test_case', TestCase);
        let StepDAO = sequelize.define('step', Step);
        let ResultDAO = sequelize.define('result', Result);
        StepDAO.hasOne(ResultDAO);
        TestCaseDAO.hasMany(StepDAO);
        ScenarioDAO.hasMany(TestCaseDAO);
        sequelize.sync().then(() => {
            console.log("Loading files...");
            let fs = require("fs");
            let report = JSON.parse(fs.readFileSync(params.report_file));
            let scenarios = [];
            for (let i = 0; i < report.length; i++) {
                let test_cases = [];
                for (let j = 0; j < report[i].elements.length; j++) {
                    let steps = []; // For each step
                    for (let k = 0; k < report[i].elements[j].steps.length; k++) {
                        let result = {
                            status: report[i].elements[j].steps[k].result.status,
                            duration: report[i].elements[j].steps[k].result.duration,
                            error_message: report[i].elements[j].steps[k].result.error_message
                        };
                        let step = {
                            description: {
                                type: Sequelize.STRING,
                                allowNull: false,
                                validate: {
                                    len: [0, 255]
                                }
                            }
                        }
                        //steps[k] = new Step(report[i].elements[j].steps[k].keyword + report[i].elements[j].steps[k].name, result);
                    }
                    // test_cases[j] = new TestCase(report[i].elements[j].name, steps);
                };
                scenarios[i] = {
                    project: report[i].tags[0].name.replace("@", ""),
                    environment: "WEB",
                    description: report[i].description.trim().replace(new RegExp('\n    ', 'gi'), ', '),
                    executed_at: Date.now()
                };
                console.log("Files were loaded successfully.");
            }
            let promisses = [];
            console.log("Saving results to database...");
            for (let j = 0; j < scenarios.length; j++) {
                promisses[j] = ScenarioDAO.create(scenarios[j]);
            }
            Promise.all(promisses).then(() => {
                console.log("Results were saved successfully.");
                sequelize.close();
            });
        })
    }).catch(err => {
        console.error('Unable to connect to the database: ', err);
    });;