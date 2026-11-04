import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  setupFiles: ['<rootDir>/test/jest-globals.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          moduleResolution: 'bundler',
        },
      },
    ],
  },
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  collectCoverageFrom: [
    'src/prestamos/prestamos.service.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  watchman: false,
  collectCoverage: true,

  /* Umbrales mínimos de cobertura (Consigna 5):
Líneas al 85%: Garantiza que casi la totalidad de la lógica de préstamos y devoluciones esta cubierta.
Ramas al 80%: Asegura que se evalúen los caminos condicionales .*/
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
    },
    './src/prestamos/prestamos.service.ts': {
      lines: 85,
      branches: 85,
    },
  },
};

export default config;
