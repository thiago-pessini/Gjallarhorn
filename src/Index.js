const request = require('request');
if (process.env.NODE_ENV !== 'production') {
    const result = require('dotenv').config();
    if (result.error) {
        console.info("Error while loading environment variables: ", result);
    }
};

let talkei = true; //This variable define if it is everything ok to the normal execution
const kvasir_api_version = process.env.KVASIR_API_VERSION || 1;
const params = {
    report_file: process.env.REPORT_FILE || "cucumber_report.json",
    kvasir_address: process.env.KVASIR_HOST || `http://localhost:3000/api/v${kvasir_api_version}/test`,
    project_name: process.env.PROJECT_NAME,
    enviroment: process.env.ENVIRONMENT,
    use_current_date: (typeof process.env.USE_CURRENT_DATE !== 'undefined')
};

if (!params.project_name) {
    console.error("Project name was not defined. You should define PROJECT_NAME variable before start the application.\nFor example 'export PROJECT_NAME=Analytics'");
    talkei = false;
    process.exitCode = 1;
};

if (!params.enviroment) {
    console.error("Environment was not defined. You should define ENVIRONMENT variable before start the application.\nFor example 'export ENVIRONMENT=WEB'");
    talkei = false;
    process.exitCode = 1;
};

if (talkei) {
    console.log('Parameters were loaded successfully.');
    let fs = require("fs");
    let report = JSON.parse(fs.readFileSync(params.report_file));
    const fileDate = params.use_current_date ? Date.now() : fs.statSync(params.report_file).birthtime;
    let scenarios = [];
    for (let i = 0; i < report.length; i++) {
        let tests = [];
        for (let j = 0; j < report[i].elements.length; j++) {
            let steps = [];
            /**
             * The last element of steps array is always an "keyword": "After "
             * Its necessary investigate if that step is part of all steps or
             * if its a default step for every test case (scenario in cucumber scope)
             */
            for (let k = 0; k < report[i].elements[j].steps.length - 1; k++) {
                steps[k] = {
                    description: report[i].elements[j].steps[k].name,
                    status: report[i].elements[j].steps[k].result.status,
                    duration: report[i].elements[j].steps[k].result.duration,
                    error_message: report[i].elements[j].steps[k].result.error_message
                };
            };
            tests[j] = {
                description: report[i].elements[j].name,
                steps: steps
            };
        };
        scenarios[i] = {
            project: params.project_name,
            environment: params.enviroment,
            description: report[i].description.trim().replace(new RegExp('\n    ', 'gi'), ', '),
            executed_at: fileDate,
            tests: tests
        };
    };

    request.post(params.kvasir_address, {
        json: scenarios
    },
        (error, response, body) => {
            if (response && response.statusCode === 201) {
                console.info(`Request made successfully to ${params.kvasir_address}`);
            } else {
                console.error(`An error occurred during the request\nError: ${error}\nResponse:`, body);
            }
        }
    );
};