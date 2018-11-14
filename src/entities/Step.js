
const Sequelize = require('sequelize');
module.exports = {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [0, 255]
        }
    }
};