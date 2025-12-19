# Xandeum pNode Explorer

A modern, interactive dashboard for monitoring the Xandeum network's pNodes (storage provider nodes). This application provides real-time analytics, geographical visualization, and detailed node statistics.

![Xandeum Network](/xandeum.png)

## Features

- **🌍 Interactive World Map**: Visualize the global distribution of pNodes.
  - **Full Coverage**: Displays all active nodes with public IPs.
  - **Zoom Controls**: Interactive zoom with +/- buttons and scroll support.
  - **Smart Clustering**: Markers scale dynamically for better visibility.
  - **Click-to-View**: Click any node marker to view detailed stats.

- **📊 Live Cluster Analytics**:
  - **Real-time Data**: Fetches data directly from the Xandeum RPC endpoint.
  - **Auto-Refresh**: Data updates automatically every 30 seconds.
  - **Key Metrics**: Monitor Total Nodes, Active Nodes, Total Storage, and Network Load.

- **🔍 Advanced Filtering & Sorting**:
  - **Search**: Filter nodes by Public Key or Version.
  - **Visibility Filter**: Toggle between Public and Private nodes.
  - **Storage Sorting**: Sort nodes by storage usage (High <-> Low).

- **📝 Detailed Node Insights**:
  - **Node Details Modal**: View comprehensive stats including Uptime, Gossip Address, and Storage usage.
  - **Pubkey Truncation**: Clean display of long public keys with full-view tooltips.

- **🎨 Modern UI/UX**:
  - **Responsive Design**: Fully optimized for desktop and mobile.
  - **Dark/Light Mode**: Seamless theme switching.
  - **Built with Shadcn UI**: Clean, accessible, and consistent components.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Maps**: [React Simple Maps](https://www.react-simple-maps.io/) & [D3 Scale](https://d3js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/xandeum-nodes.git
   cd xandeum-nodes
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

The application is configured to fetch data from the Xandeum RPC endpoint. You can modify the endpoint in `app/api/pnodes/route.ts` if needed.

## License

This project is licensed under the MIT License.
