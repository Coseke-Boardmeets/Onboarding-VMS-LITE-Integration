module.exports = {
    default: {
        require: ["features/steps-definitions/**/*.ts"],
        requireModule: ["ts-node/register"],
        format: ["progress-bar", "html:cucumber-report.html"],
        paths: ["features/**/*.feature"],
    },
};