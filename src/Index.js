const request = require('request');

console.log('Loading parameters...');
const kvasir_api_version = process.env.KVASIR_API_VERSION || 1;
const params = {
    report_file: process.env.REPORT_FILE || "cucumber_report.json",
    kvasir_address: process.env.KVASIR_HOST || `http://localhost:4000/api/v${kvasir_api_version}/test`,
    project_name: process.env.PROJECT_NAME,
    enviroment: process.env.ENVIRONMENT
};

if (!params.project_name) {
    console.error("Project name was not defined. You should define PROJECT_NAME variable before start the application.\nFor example 'export PROJECT_NAME=Analytics'");
    process.exitCode = 1;
};

if (!params.enviroment) {
    console.error("Environment was not defined. You should define ENVIRONMENT variable before start the application.\nFor example 'export ENVIRONMENT=WEB'");
    process.exitCode = 1;
};
if (params.project_name && params.enviroment) {
    console.log('Parameters were loaded successfully.');
    let fs = require("fs");
    let report = JSON.parse(fs.readFileSync(params.report_file));
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
            for (let k = 0; k < report[i].elements[j].steps.length-1; k++) {
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
            executed_at: Date.now(),
            tests: tests
        };
    };

    // console.log(JSON.stringify(scenarios));
    request.post(params.kvasir_address, {
        json: scenarios
    },
        (error, response, body) => {
            console.log(response.statusCode);
        }
    );
};