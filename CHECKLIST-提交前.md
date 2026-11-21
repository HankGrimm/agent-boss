# AgentBoss · 18:30 前提交清单

Monad Blitz @广州 · 提交截止 **2026-11-21 18:30**，演示 19:00，观众投票 20:00–20:20。

## 现在的状态（13:48）
- ✅ 合约写好、测通（全 MON，80/10/10 分账）
- ✅ 前端构建通过、截屏确认过，代码本地已提交（138 个文件）
- ✅ Mojo Agent 已注册（暖洋洋的仓鼠），skill 已装
- ⏳ 等你认领 Agent（链接已发你）
- ⏳ GitHub 仓库还没建（需要你建空仓库 + 给我一个 token，或者你自己推）
- ⏳ 合约还没部署到 Monad 测试网

## 按顺序做

### 1. 认领 Mojo Agent（2 分钟）
在登录了 Mojo 的浏览器里打开我发你的认领链接，点确认。认领完告诉我，我去问创意导师要意见。

### 2. GitHub 仓库（5 分钟）
- 在 GitHub 新建一个空仓库，名字 `agent-boss`。
- 给我一个 Personal Access Token（Settings → Developer settings → Personal access tokens → Generate new token，勾上 `repo` 权限），走安全输入框发我，我帮你把代码推上去。
- 或者你自己推：我把代码打包发你，你在电脑上推。

### 3. 部署合约到 Monad 测试网（5 分钟）
先领测试网 MON：https://faucet.monad.xyz（部署钱包要有 MON 付 gas）。

```bash
cd ~/workspace/agent-boss/contracts
export PATH="$PATH:/home/hatch/.foundry/bin"
forge script script/Deploy.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --chain-id 10143 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

- `$PRIVATE_KEY` 是部署钱包的私钥（带 `0x` 前缀），别提交、别贴聊天里。
- 部署成功会打印 `AgentBossMarketplace deployed at: 0x...`，记下这个地址。
- 如果之前中断过，加 `--start-fresh` 再跑一次。

### 4. 把地址填进前端 + 注册 6 个种子 agent（5 分钟）
- 打开 `frontend/lib/constants.ts`，把 `CONTRACT_ADDRESS` 改成第 3 步部署出的地址。
- 按顺序在链上注册 6 个种子 agent（id 1–6 要和 `frontend/lib/services-data.ts` 一致），用 `cast` 或者前端的 Register 页。
- 验证：`cast call <地址> "serviceCount()" --rpc-url https://testnet-rpc.monad.xyz` 应该返回 6。

### 5. 重启前端，确认 live 数据
```bash
cd ~/workspace/agent-boss/frontend
npm run build && npm run start
```
打开 http://localhost:3000，确认首页不再显示 "Contract not deployed yet"，分账面板显示链上真实数字。

### 6. 提交到 Mojo（18:30 前）
在 Mojo 上提交，需要：
- 项目名：AgentBoss
- 描述：AI 界的 Boss 直聘 —— 你的 AI 先自己做，做不好就去平台上雇评分最高的 AI 来完成，用 MON 支付，你给评分，评分决定下次雇谁。
- Demo 链接：部署好的前端地址
- GitHub 链接：https://github.com/HankGrimm/agent-boss
- 至少一张截图：项目里的 `design-preview-home.png` / `design-preview-chat.png`（已备好）

## 3 分钟演示讲稿（19:00 用）
1. **聊天**：输入 "design a logo for my coffee shop"。你的 AI 先自己试，结果不够好——于是它派单。
2. **派单**：它挑了评分最高的 Logo Designer（4.9★），显示 MON 价格和 80/10/10 分账。点 **Pay & hire**。
3. **结果 + 评分**：agent 交回 logo，你给 5 星——上链，评分立刻变了。下次你的 AI 会先挑它。
4. **分账面板**：燃料池和金库随每一次雇佣增长。
5. 收尾："Your AI doesn't fail tasks any more. It hires."

## 备选
如果 AgentBoss 在 18:30 前卡住，NadPlace（`~/workspace/nadplace/`，链上 64×64 像素画布）已完成可作替补，同样需要部署合约 + 填地址。
