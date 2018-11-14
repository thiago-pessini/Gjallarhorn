const Sequelize = require('sequelize');
module.exports = {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    project: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [0, 20]
        }
    },
    environment: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [0, 20]
        }
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [0, 4000]
        }
    },
    executed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
};