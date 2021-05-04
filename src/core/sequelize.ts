import { Column, CreatedAt, DataType, ForeignKey, ModelClassGetter, Sequelize, UpdatedAt } from 'sequelize-typescript';
import { v4 } from 'uuid';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';
import { User } from "./models/User";

function init(): Sequelize {
  return new Sequelize({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'mysql',
    models: [__dirname + '/models'],
    logging: true
  });
}

let sequelizeInstance: Sequelize;

export const sequelize = {
  instance() {
    if (!sequelizeInstance) {
      sequelizeInstance = init();
      sequelizeInstance.authenticate().then(() => {
        User.init({
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          email: {
            type: DataTypes.STRING,
            unique: true
          },
          password: {type: DataTypes.STRING },
          firstName: { type: DataTypes.STRING},
          lastName: { type: DataTypes.STRING},
          about: { type: DataTypes.STRING},
          imageUrl: { type: DataTypes.STRING},
          interests: { type: DataTypes.STRING},
        }, { sequelize: sequelizeInstance, modelName: 'User'} );
        User.sync().then();
        console.log('Connection has been established successfully.');
      })
          .catch(err => {
            console.error('Unable to connect to the database:', err);
          });
    }

    return sequelizeInstance;
  }
};

export const ColumnPrimaryKeyRandomUid = Column({
  type: DataType.STRING(36),
  primaryKey: true,
  allowNull: false,
  defaultValue: () => v4()
});

export const ColumnPrimaryKeyAutoincrement = Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false });

export function NotNullColumn(options?: Omit<Partial<ModelAttributeColumnOptions>, 'allowNull'>) {
  const columnFn = Column({ ...options, ...{ allowNull: false } });
  return function (target: any, key: any) {
    columnFn(target, key);
  };
}

export function ColumnCreatedAt(options?: Partial<Omit<ModelAttributeColumnOptions, 'allowNull'>>) {
  const columnFn = Column({ ...options, ...{ allowNull: false } });

  return function (target: any, key: any) {
    CreatedAt(target, key);
    columnFn(target, key);
  };
}

export function ColumnUpdatedAt(options?: Partial<Omit<ModelAttributeColumnOptions, 'allowNull'>>) {
  const columnFn = Column({ ...options, ...{ allowNull: false } });

  return function (target: any, key: any) {
    UpdatedAt(target, key);
    columnFn(target, key);
  };
}

export function ColumnForeignKeyToInt(relatedClassGetter: ModelClassGetter<any, any>,
                                      columnOptions?: Partial<Omit<ModelAttributeColumnOptions, 'type'>>) {
  const foreignKeyFn = ForeignKey(relatedClassGetter);
  const columnFn = Column({ ...columnOptions, ...{ type: DataType.INTEGER } });

  return function (target: any, key: any) {
    foreignKeyFn(target, key);
    columnFn(target, key);
  };
}

export function ColumnForeignKeyToUid(relatedClassGetter: ModelClassGetter<any, any>,
                                      columnOptions?: Partial<Omit<ModelAttributeColumnOptions, 'type'>>) {
  const foreignKeyFn = ForeignKey(relatedClassGetter);
  const fullColumnOptions = { ...columnOptions, ...{ type: DataType.STRING(36) } };
  const columnFn = Column(fullColumnOptions);

  return function (target: any, key: any) {
    foreignKeyFn(target, key);
    columnFn(target, key);
  };
}

export function ColumnUrl(columnOptions?: Partial<Omit<ModelAttributeColumnOptions, 'type'>>) {
  const fullColumnOptions = { ...columnOptions, ...{ type: DataType.STRING(2000) } };
  const columnFn = Column(fullColumnOptions);

  return function (target: any, key: any) {
    columnFn(target, key);
  };
}
