const Sequelize = require('sequelize');
module.exports = {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    status: {
        type: Sequelize.STRING,
        validate: {
            isIn: [['passed', 'failed', 'skipped']],
        }
    },
    duration: {
        type: Sequelize.BIGINT,
        allowNull: true
    },
    error_message: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            len: [0, 4000]
        }
    }
};