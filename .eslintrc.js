module.exports = {
  // 其他配置项...
  rules: {
    // 禁用所有规则
    "no-unused-vars": "off",
    // 其他规则可以根据需要启用或禁用
  },
  "parserOptions": {
    "ecmaVersion": 7,
    "sourceType": "module"
  },
  "parser": "babel-eslint", // 处理class类中eslint报错
};
