<div align="center">
  <!-- You can replace this banner with a screenshot of the robot face later -->
  <h1>🤖 BotFace</h1>
  <p><strong>沉浸式本地 AI 机器人终端 | Immersive Local AI Robot Interface</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#technology">Technology</a>
  </p>
</div>

---

**BotFace** 是一个运行在浏览器中的沉浸式 AI 交互界面。它不仅仅是一个聊天机器人，它拥有"灵魂"——通过 WebGPU 技术，大语言模型直接在你的本地显卡上运行，驱动一个具有实时情绪反馈的机器人面孔。

> 🚀 **无需 API Key，零隐私泄露，完全免费。**

## ✨ 特性 (Features)

- **🧠 本地大脑 (WebGPU)**: 集成 `@mlc-ai/web-llm`，直接在浏览器端运行 LLM (如 Qwen2.5, Llama 3)。
- **🎭 情感引擎**: 机器人的表情（开心、愤怒、怀疑、思考等）会根据对话内容和上下文实时变化。
- **💬 独特人格**: 默认设定为类似"火箭浣熊"的性格——可爱、嘴贱、讲义气，会主动发起闲聊和吐槽。
- **🔒 绝对隐私**: 所有计算都在本地完成，对话数据不上传云端。
- **⚡ 极速响应**: 一旦模型加载完成，对话延迟极低。

## 🛠️ 快速开始 (Getting Started)

### 前置要求
- **浏览器**: 最新版的 Chrome, Edge, Arc 或其他支持 WebGPU 的浏览器。
- **硬件**: 建议拥有独立显卡或高性能核显（如 Apple M1/M2/M3, NVIDIA RTX 系列）。

### 安装步骤

1. **克隆项目**:
   ```bash
   git clone [repository-url]
   cd botface
   ```

2. **安装依赖**:
   ```bash
   npm install
   ```

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```

4. **体验**:
   打开浏览器访问控制台显示的地址（通常是 `http://localhost:5173`）。
   *首次运行时需要下载模型权重（约 1-2GB），请耐心等待初始化进度条完成。*

## 🏗️ 技术栈 (Technology)

- **Frontend**: React 19, TypeScript, Vite
- **AI Inference**: [WebLLM](https://webllm.mlc.ai/) (WebGPU accelerated)
- **Styling**: TailwindCSS
- **Animation**: SVG-based procedural animations

## 📝 注意事项

- **模型加载**: 首次加载模型取决于你的网速。
- **显存占用**: 运行 1.5B/3B 参数的模型大约需要 2GB-4GB 的显存/统一内存。
