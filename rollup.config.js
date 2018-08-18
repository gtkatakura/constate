import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import { uglify } from "rollup-plugin-uglify";
import ignore from "rollup-plugin-ignore";
import pkg from "./package.json";

const external = Object.keys(pkg.peerDependencies || {});
const allExternal = [...external, Object.keys(pkg.dependencies || {})];
const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return id => pattern.test(id);
};

const common = {
  input: "src/index.js"
};

const createCommonPlugins = () => [
  babel({
    exclude: "node_modules/**"
  }),
  filesize()
];

const main = {
  input: "src/index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named"
    },
    {
      file: pkg.module,
      format: "es"
    }
  ],
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(), resolve({ extensions })]
};

const unpkg = Object.assign({}, common, {
  output: {
    name: pkg.name,
    file: pkg.unpkg,
    format: "umd",
    exports: "named",
    globals: {
      react: "React"
    }
  },
  external: makeExternalPredicate(external),
  plugins: [
    ...createCommonPlugins(),
    ignore(["stream"]),
    uglify(),
    commonjs({
      include: /node_modules/
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    resolve({
      preferBuiltins: false
    })
  ]
});

export default [main, unpkg];
