import { useState, useEffect } from 'react'
import { Card, Slider, Table, Typography, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'

const { Title, Text } = Typography

interface Bond {
  bond_code: string
  bond_name: string
  stock_code: string
  stock_name: string
  price: number
  convert_value: number
  premium_rate: number
  yield_to_maturity: number
  remaining_years: number
  rating: string
}

function BondScreener() {
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState<[number, number]>([80, 150])
  const [maxPremiumRate, setMaxPremiumRate] = useState<number>(100)

  useEffect(() => {
    axios.get('http://localhost:8000/api/bonds')
      .then(response => {
        setBonds(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('获取数据失败:', error)
        setLoading(false)
      })
  }, [])

  // 筛选逻辑
  const filteredBonds = bonds.filter(bond => {
    const priceMatch = bond.price >= priceRange[0] && bond.price <= priceRange[1]
    const premiumMatch = bond.premium_rate <= maxPremiumRate
    return priceMatch && premiumMatch
  })

  const columns: ColumnsType<Bond> = [
    {
      title: '代码',
      dataIndex: 'bond_code',
      key: 'bond_code',
      width: 100,
    },
    {
      title: '名称',
      dataIndex: 'bond_name',
      key: 'bond_name',
      width: 120,
    },
    {
      title: '正股',
      dataIndex: 'stock_name',
      key: 'stock_name',
      width: 120,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: '转股价值',
      dataIndex: 'convert_value',
      key: 'convert_value',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '溢价率',
      dataIndex: 'premium_rate',
      key: 'premium_rate',
      width: 100,
      render: (rate: number) => `${rate.toFixed(2)}%`,
      sorter: (a, b) => a.premium_rate - b.premium_rate,
    },
    {
      title: '到期收益率',
      dataIndex: 'yield_to_maturity',
      key: 'yield_to_maturity',
      width: 110,
      render: (yield_val: number) => `${yield_val.toFixed(2)}%`,
      sorter: (a, b) => a.yield_to_maturity - b.yield_to_maturity,
    },
    {
      title: '剩余年限',
      dataIndex: 'remaining_years',
      key: 'remaining_years',
      width: 100,
      render: (years: number) => `${years.toFixed(1)}年`,
    },
    {
      title: '评级',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: string) => (
        <Tag color={rating.startsWith('AAA') ? 'green' : rating.startsWith('AA') ? 'blue' : 'orange'}>
          {rating}
        </Tag>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>可转债筛选器</Title>

      <Card title="筛选条件" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>价格范围: </Text>
            <Text>¥{priceRange[0]} - ¥{priceRange[1]}</Text>
            <Slider
              range
              min={80}
              max={150}
              value={priceRange}
              onChange={setPriceRange}
              style={{ width: '100%', maxWidth: '400px' }}
            />
          </div>
          <div>
            <Text strong>最大溢价率: </Text>
            <Text>{maxPremiumRate}%</Text>
            <Slider
              min={0}
              max={100}
              value={maxPremiumRate}
              onChange={setMaxPremiumRate}
              style={{ width: '100%', maxWidth: '400px' }}
            />
          </div>
        </Space>
      </Card>

      <Card title={`共 ${filteredBonds.length} 只可转债`}>
        <Table
          dataSource={filteredBonds}
          columns={columns}
          rowKey="bond_code"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  )
}

export default BondScreener
