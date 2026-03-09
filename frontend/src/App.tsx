import { useState } from 'react'
import { Layout, Menu, Typography } from 'antd'
import {
  FilterOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import BondScreener from './BondScreener'
import StrategyConfig from './StrategyConfig'
import './App.css'

const { Header, Content } = Layout
const { Title } = Typography

type PageType = 'screener' | 'strategy' | 'results'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('screener')

  const menuItems = [
    {
      key: 'screener',
      icon: <FilterOutlined />,
      label: '可转债筛选',
    },
    {
      key: 'strategy',
      icon: <SettingOutlined />,
      label: '策略配置',
    },
    {
      key: 'results',
      icon: <BarChartOutlined />,
      label: '回测结果',
      disabled: true,
    },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'screener':
        return <BondScreener />
      case 'strategy':
        return <StrategyConfig />
      case 'results':
        return <div style={{ padding: 24, textAlign: 'center' }}>回测结果页面开发中...</div>
      default:
        return <BondScreener />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <Title level={4} style={{ color: '#fff', margin: 0, marginRight: '48px' }}>
          可转债回测系统
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key as PageType)}
          style={{ flex: 1, background: 'transparent' }}
        />
      </Header>
      <Content style={{ background: '#f5f5f5' }}>
        {renderPage()}
      </Content>
    </Layout>
  )
}

export default App
