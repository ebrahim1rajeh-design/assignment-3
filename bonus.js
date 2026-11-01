/**
 * LeetCode Problem 14: Longest Common Prefix
 * URL: https://leetcode.com/problems/longest-common-prefix/
 *
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
  // If array is empty, there is no common prefix
  if (!strs || strs.length === 0) return "";

  // Assume the first string is the common prefix
  let prefix = strs[0];

  // Compare the prefix with each subsequent string
  for (let i = 1; i < strs.length; i++) {
    // Trim the prefix character by character until strs[i] starts with prefix
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);

      // If prefix becomes empty, no common prefix exists
      if (prefix === "") {
        return "";
      }
    }
  }

  return prefix;
};

// Example Test Cases (for local testing with: node bonus.js)
console.log('--- Test Cases for Longest Common Prefix ---');
console.log('Test 1: ["flower", "flow", "flight"] ->', JSON.stringify(longestCommonPrefix(["flower", "flow", "flight"]))); // Output: "fl"
console.log('Test 2: ["dog", "racecar", "car"] ->', JSON.stringify(longestCommonPrefix(["dog", "racecar", "car"])));       // Output: ""
console.log('Test 3: ["interspecies", "interstellar", "interstate"] ->', JSON.stringify(longestCommonPrefix(["interspecies", "interstellar", "interstate"]))); // Output: "inters"

module.exports = longestCommonPrefix;

