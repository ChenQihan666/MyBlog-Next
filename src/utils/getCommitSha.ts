import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * 取本次构建所用提交的 7 位短哈希，页脚用它显示"当前部署的是哪一次提交"。
 *
 * 依次尝试四个来源，谁先给出有效值就用谁：
 *   1. 构建平台注入的环境变量
 *   2. git 命令（git rev-parse）
 *   3. 构建目录里的 git 元数据文件（没有 git 命令时兜底）
 *   4. GitHub API 上 main 的最新提交（前三个都不通时兜底）
 * 四个都不通则返回 null，页脚那块不渲染，并在构建日志里留一行。
 */

const REPO = "ChenQihan666/MyBlog-Next";

function fromEnv(): string | null {
  const names = [
    "EO_COMMIT_SHA",
    "COMMIT_REF",
    "GITHUB_SHA",
    "CI_COMMIT_SHA",
    "CF_PAGES_COMMIT_SHA",
    "VERCEL_GIT_COMMIT_SHA",
  ];
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim().length >= 7) {
      return value.trim().slice(0, 7);
    }
  }
  return null;
}

function findGitDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 4; i++) {
    if (existsSync(join(dir, ".git"))) return join(dir, ".git");
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function fromGitCommand(): string | null {
  try {
    const sha = execSync("git rev-parse --short=7 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return sha.length >= 7 ? sha : null;
  } catch {
    return null;
  }
}

function fromGitFiles(): string | null {
  try {
    const gitDir = findGitDir();
    if (!gitDir) return null;

    const head = readFileSync(join(gitDir, "HEAD"), "utf8").trim();
    // detached HEAD（浅克隆常见）时 HEAD 里直接就是提交号
    if (!head.startsWith("ref:")) return head.slice(0, 7);

    const ref = head.replace("ref:", "").trim();
    const refFile = join(gitDir, ref);
    if (existsSync(refFile)) {
      return readFileSync(refFile, "utf8").trim().slice(0, 7);
    }

    const packed = join(gitDir, "packed-refs");
    if (existsSync(packed)) {
      const line = readFileSync(packed, "utf8")
        .split("\n")
        .find(item => item.endsWith(" " + ref));
      if (line) return line.split(" ")[0].slice(0, 7);
    }
    return null;
  } catch {
    return null;
  }
}

async function fromGitHubApi(): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits/main`, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "qihanx-site-build",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.sha === "string" ? data.sha.slice(0, 7) : null;
  } catch {
    return null;
  }
}

let cached: string | null | undefined;

export async function getCommitSha(): Promise<string | null> {
  if (cached !== undefined) return cached;

  const sources: [string, () => string | null | Promise<string | null>][] = [
    ["环境变量", fromEnv],
    ["git 命令", fromGitCommand],
    ["git 元数据文件", fromGitFiles],
    ["GitHub API", fromGitHubApi],
  ];

  for (const [name, read] of sources) {
    const sha = await read();
    if (sha) {
      console.log(`[footer] 提交号 ${sha}，来源：${name}`);
      cached = sha;
      return cached;
    }
  }

  console.warn("[footer] 四个来源都没取到提交号，这次页脚不显示");
  cached = null;
  return cached;
}
