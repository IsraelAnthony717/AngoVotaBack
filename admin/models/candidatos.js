const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Candidato = sequelize.define('candidatos', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    idade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    descricao: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    partido: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    abrevpartido: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
    cor: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#0d59f2'
    },
    foto: {
      type: DataTypes.TEXT, // para base64 ou URL
      allowNull: true
    },
    total_votos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
}, 
    // Mantendo campos antigos que talvez sejam necessários
    criando_em: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'candidatos',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "candidatos_pkey",
        unique: true,
        fields: [{ name: "id" }]
      }
    ]
  });

  Candidato.associate = (models) => {
    Candidato.hasOne(models.votos, {
      foreignKey: 'candidato_id',
      as: 'voto'
    });
  };

  return Candidato;
};