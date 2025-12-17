/**
 * 将数字格式化为中文单位（个、万、亿）
 * @param value 输入数字
 * @param digits 保留小数位（默认 2）
 */
export function formatChineseNumber(
  value: number | bigint,
  digits: number = 2
): string {
  // 转换为 BigInt 处理大整数
  const num = typeof value === "bigint" ? value : BigInt(Math.floor(value));

  const UNITS = [
    { unit: "亿", value: 100000000n },
    { unit: "万", value: 10000n },
  ];

  for (const { unit, value: base } of UNITS) {
    if (num >= base) {
      const main = Number(num) / Number(base);
      return `${main.toFixed(digits)} ${unit}`;
    }
  }

  // 不到 1 万的直接输出
  return num.toString();
}

