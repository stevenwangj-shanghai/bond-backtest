import { useState } from 'react'
import {
  Card,
  Form,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  DatePicker,
  Checkbox,
  Table,
  Modal,
  Tag,
  Radio
} from 'antd'
import {
  PlayCircleOutlined,
  SettingOutlined,
  FilterOutlined,
  BarChartOutlined,
  SaveOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import './StrategyConfig.css'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// 基础设置默认值（固定，不显示）
const DEFAULT_BASE_CONFIG = {
  holdCount: 10,
  holdPercent: 10,
  rebalanceDays: 5,
  tradeCost: 0.001,
  minHoldDays: 1,
  benchmark: 'hs300',
}

interface ScoreFactor {
  id: string
  name: string
  direction: 'asc' | 'desc'
  weight: number
  missingValue: string
  neutralize: string
}

interface Condition {
  id: string
  factor: string
  operator: string
  value: number
  unit?: string
}

// 可选因子列表
const AVAILABLE_FACTORS = [
  { category: '基础因子', factors: [
    { value: 'double_low', label: '双低' },
    { value: 'price', label: '收盘价' },
    { value: 'premium_rate', label: '转股溢价率' },
    { value: 'yield_to_maturity', label: '到期收益率' },
    { value: 'remaining_years', label: '剩余年限' },
    { value: 'bond_size', label: '剩余规模' },
    { value: 'turnover', label: '换手率' },
    { value: 'turnover_5d', label: '5日换手率' },
    { value: 'convert_value', label: '转股价值' },
  ]},
  { category: '历史类因子', factors: [
    { value: 'price_change_5d', label: '5日涨跌幅' },
    { value: 'price_change_20d', label: '20日涨跌幅' },
    { value: 'price_change_60d', label: '60日涨跌幅' },
  ]},
  { category: '正股相关因子', factors: [
    { value: 'stock_price_change_5d', label: '正股5日涨跌幅' },
    { value: 'stock_price_change_20d', label: '正股20日涨跌幅' },
    { value: 'stock_market_cap', label: '正股市值' },
    { value: 'stock_pe', label: '正股PE' },
    { value: 'stock_pb', label: '正股PB' },
  ]},
]

// 所有因子平铺列表（用于条件选择）
const ALL_FACTORS = AVAILABLE_FACTORS.flatMap(cat => cat.factors)

// 比较运算符
const OPERATORS = [
  { value: '<', label: '小于' },
  { value: '<=', label: '小于等于' },
  { value: '=', label: '等于' },
  { value: '>=', label: '大于等于' },
  { value: '>', label: '大于' },
  { value: '!=', label: '不等于' },
  { value: 'rank<', label: '小于排名' },
  { value: 'rank<=', label: '小于等于排名' },
]

function StrategyConfig() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  // 打分因子
  const [scoreFactors, setScoreFactors] = useState<ScoreFactor[]>([
    { id: '1', name: '双低', direction: 'asc', weight: 1, missingValue: '不处理', neutralize: '不处理' },
    { id: '2', name: '5日换手率', direction: 'desc', weight: 0.5, missingValue: '不处理', neutralize: '不处理' },
  ])
  const [isFactorModalOpen, setIsFactorModalOpen] = useState(false)
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  
  // 买入条件
  const [buyConditions, setBuyConditions] = useState<Condition[]>([])
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [newBuyCondition, setNewBuyCondition] = useState<Partial<Condition>>({
    factor: 'price',
    operator: '<',
    value: 95,
  })
  
  // 卖出条件
  const [sellConditions, setSellConditions] = useState<Condition[]>([])
  const [isSellModalOpen, setIsSellModalOpen] = useState(false)
  const [newSellCondition, setNewSellCondition] = useState<Partial<Condition>>({
    factor: 'price',
    operator: '>',
    value: 150,
  })

  const handleStartBacktest = () => {
    const values = form.getFieldsValue()
    const fullConfig = { 
      ...DEFAULT_BASE_CONFIG, 
      ...values, 
      scoreFactors,
      buyConditions,
      sellConditions
    }
    console.log('开始回测:', fullConfig)
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  // 打分因子相关
  const handleAddFactor = () => {
    setIsFactorModalOpen(true)
    setSelectedFactors(scoreFactors.map(f => f.name))
  }

  const handleFactorModalOk = () => {
    const newFactors = selectedFactors
      .filter(name => !scoreFactors.some(f => f.name === name))
      .map((name, index) => ({
        id: Date.now() + index,
        name,
        direction: 'asc' as const,
        weight: 1,
        missingValue: '不处理',
        neutralize: '不处理',
      }))
    setScoreFactors([...scoreFactors, ...newFactors])
    setIsFactorModalOpen(false)
  }

  const handleDeleteFactor = (id: string) => {
    setScoreFactors(scoreFactors.filter(f => f.id !== id))
  }

  const handleFactorChange = (id: string, field: keyof ScoreFactor, value: any) => {
    setScoreFactors(scoreFactors.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  // 买入条件相关
  const handleAddBuyCondition = () => {
    if (newBuyCondition.factor && newBuyCondition.operator && newBuyCondition.value !== undefined) {
      const condition: Condition = {
        id: Date.now().toString(),
        factor: newBuyCondition.factor,
        operator: newBuyCondition.operator,
        value: newBuyCondition.value,
      }
      setBuyConditions([...buyConditions, condition])
      setIsBuyModalOpen(false)
      setNewBuyCondition({ factor: 'price', operator: '<', value: 95 })
    }
  }

  const handleDeleteBuyCondition = (id: string) => {
    setBuyConditions(buyConditions.filter(c => c.id !== id))
  }

  // 卖出条件相关
  const handleAddSellCondition = () => {
    if (newSellCondition.factor && newSellCondition.operator && newSellCondition.value !== undefined) {
      const condition: Condition = {
        id: Date.now().toString(),
        factor: newSellCondition.factor,
        operator: newSellCondition.operator,
        value: newSellCondition.value,
      }
      setSellConditions([...sellConditions, condition])
      setIsSellModalOpen(false)
      setNewSellCondition({ factor: 'price', operator: '>', value: 150 })
    }
  }

  const handleDeleteSellCondition = (id: string) => {
    setSellConditions(sellConditions.filter(c => c.id !== id))
  }

  // 表格列定义
  const factorColumns = [
    { title: '因子', dataIndex: 'name', key: 'name', width: 100 },
    { 
      title: '方向偏好', 
      dataIndex: 'direction', 
      key: 'direction',
      width: 120,
      render: (direction: string, record: ScoreFactor) => (
        <Select value={direction} onChange={(v) => handleFactorChange(record.id, 'direction', v)} style={{ width: '100%' }}>
          <Option value="asc">越小越好</Option>
          <Option value="desc">越大越好</Option>
        </Select>
      ),
    },
    { 
      title: '权重', 
      dataIndex: 'weight', 
      key: 'weight',
      width: 80,
      render: (weight: number, record: ScoreFactor) => (
        <InputNumber value={weight} min={0} max={10} step={0.1} 
          onChange={(v) => handleFactorChange(record.id, 'weight', v)} style={{ width: '100%' }} />
      ),
    },
    { 
      title: '缺失值处理', 
      dataIndex: 'missingValue', 
      key: 'missingValue',
      width: 120,
      render: (value: string, record: ScoreFactor) => (
        <Select value={value} onChange={(v) => handleFactorChange(record.id, 'missingValue', v)} style={{ width: '100%' }}>
          <Option value="不处理">不处理</Option>
          <Option value="填充最小值">填充最小值</Option>
          <Option value="填充最大值">填充最大值</Option>
          <Option value="填充均值">填充均值</Option>
          <Option value="填充中位数">填充中位数</Option>
        </Select>
      ),
    },
    { 
      title: '中性化', 
      dataIndex: 'neutralize', 
      key: 'neutralize',
      width: 100,
      render: (value: string, record: ScoreFactor) => (
        <Select value={value} onChange={(v) => handleFactorChange(record.id, 'neutralize', v)} style={{ width: '100%' }}>
          <Option value="不处理">不处理</Option>
          <Option value="剩余规模">剩余规模</Option>
          <Option value="剩余市值">剩余市值</Option>
          <Option value="行业">行业</Option>
        </Select>
      ),
    },
    { 
      title: '操作', 
      key: 'action',
      width: 60,
      render: (_: any, record: ScoreFactor) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteFactor(record.id)} />
      ),
    },
  ]

  const conditionColumns = [
    { 
      title: '因子', 
      dataIndex: 'factor', 
      key: 'factor',
      render: (factor: string) => ALL_FACTORS.find(f => f.value === factor)?.label || factor
    },
    { 
      title: '比较符', 
      dataIndex: 'operator', 
      key: 'operator',
      render: (op: string) => OPERATORS.find(o => o.value === op)?.label || op
    },
    { 
      title: '值', 
      dataIndex: 'value', 
      key: 'value',
      render: (value: number) => value
    },
    { 
      title: '操作', 
      key: 'action',
      width: 60,
      render: (_: any, record: Condition) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => 
          record.id.startsWith('buy') ? handleDeleteBuyCondition(record.id) : handleDeleteSellCondition(record.id)
        } />
      ),
    },
  ]

  return (
    <div className="strategy-config-container">
      {/* 顶部标题 */}
      <div className="page-header">
        <h1 className="page-title">
          <SettingOutlined style={{ marginRight: 8 }} /> 策略配置
        </h1>
        <Space>
          <Button icon={<UploadOutlined />}>加载策略</Button>
          <Button icon={<SaveOutlined />}>保存策略</Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        <div className="strategy-content">
          {/* 左侧：买入条件 + 打分因子 */}
          <div className="strategy-left">
            {/* 买入条件 - 禄得网样式 */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><FilterOutlined /> 买入条件</span>
                  <Button type="link" size="small" onClick={() => setIsBuyModalOpen(true)}>添加条件</Button>
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
              {buyConditions.length === 0 ? (
                <div className="empty-state">
                  暂无买入条件，点击"添加条件"
                </div>
              ) : (
                <Table
                  dataSource={buyConditions.map(c => ({ ...c, id: `buy-${c.id}` }))}
                  columns={conditionColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  showHeader={true}
                />
              )}
            </Card>

            {/* 打分因子 */}
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><BarChartOutlined /> 打分因子</span>
                  <Space>
                    <Button type="link" danger size="small" onClick={() => setScoreFactors([])}>全部清空</Button>
                    <Button type="link" size="small" onClick={handleAddFactor}>添加打分因子</Button>
                  </Space>
                </div>
              }
            >
              <Table
                dataSource={scoreFactors}
                columns={factorColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          {/* 右侧：排除因子 + 卖出条件 */}
          <div className="strategy-right">
            {/* 排除因子 */}
            <Card
              title={<><FilterOutlined /> 排除因子</>}
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Form.Item name="excludeST" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
                    <Checkbox>排除ST股票</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="excludeSuspended" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
                    <Checkbox>排除停牌债券</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="excludeRedeem" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
                    <Checkbox>排除已公告强赎</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="excludeLowRating" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Checkbox>排除低评级(低于AA-)</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="excludeSmallCap" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Checkbox>排除小市值(低于3亿)</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="excludeLowTurnover" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Checkbox>排除低换手率(低于1%)</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="excludeHighPremium" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Checkbox>排除高溢价(高于80%)</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ marginTop: '16px' }}>
                <Form.Item label="排除新债(上市未满N天)" name="excludeNewBondDays" initialValue={3} style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={30} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </Card>

            {/* 卖出条件 - 禄得网样式 */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><FilterOutlined /> 卖出条件</span>
                  <Button type="link" size="small" onClick={() => setIsSellModalOpen(true)}>添加条件</Button>
                </div>
              }
            >
              {sellConditions.length === 0 ? (
                <div className="empty-state">
                  暂无卖出条件，点击"添加条件"
                </div>
              ) : (
                <Table
                  dataSource={sellConditions.map(c => ({ ...c, id: `sell-${c.id}` }))}
                  columns={conditionColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </div>
        </div>

        {/* 回测时间 */}
        <Card title="回测时间范围" className="backtest-time-card">
          <Row gutter={24} align="middle">
            <Col span={12}>
              <Form.Item name="backtestRange" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Space>
                <Button size="small">近1年</Button>
                <Button size="small">近3年</Button>
                <Button size="small">近5年</Button>
                <Button size="small">全部</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 开始回测按钮 */}
        <div className="start-backtest-btn">
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleStartBacktest}
            loading={loading}
          >
            开始回测
          </Button>
        </div>
      </Form>

      {/* 添加打分因子弹窗 */}
      <Modal title="添加打分因子" open={isFactorModalOpen} onOk={handleFactorModalOk} onCancel={() => setIsFactorModalOpen(false)} width={700}>
        <div className="selected-factors">
          <Text>已选因子：</Text>
          {selectedFactors.map(factor => (
            <Tag key={factor} closable onClose={() => setSelectedFactors(selectedFactors.filter(f => f !== factor))}>
              {factor}
            </Tag>
          ))}
        </div>
        {AVAILABLE_FACTORS.map(category => (
          <div key={category.category} className="factor-category">
            <span className="factor-category-title">{category.category}</span>
            <div className="factor-buttons">
              {category.factors.map(factor => (
                <Button
                  key={factor.value}
                  type={selectedFactors.includes(factor.label) ? 'primary' : 'default'}
                  size="small"
                  onClick={() => {
                    if (selectedFactors.includes(factor.label)) {
                      setSelectedFactors(selectedFactors.filter(f => f !== factor.label))
                    } else {
                      setSelectedFactors([...selectedFactors, factor.label])
                    }
                  }}
                >
                  {factor.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      {/* 添加买入条件弹窗 */}
      <Modal title="添加买入条件" open={isBuyModalOpen} onOk={handleAddBuyCondition} onCancel={() => setIsBuyModalOpen(false)}>
        <div className="condition-form-item">
          <label>选择因子：</label>
          <Select style={{ width: '100%' }} value={newBuyCondition.factor} onChange={(v) => setNewBuyCondition({...newBuyCondition, factor: v})}>
            {ALL_FACTORS.map(f => <Option key={f.value} value={f.value}>{f.label}</Option>)}
          </Select>
        </div>
        <div className="condition-form-item">
          <label>比较符：</label>
          <Select style={{ width: '100%' }} value={newBuyCondition.operator} onChange={(v) => setNewBuyCondition({...newBuyCondition, operator: v})}>
            {OPERATORS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
          </Select>
        </div>
        <div className="condition-form-item">
          <label>值：</label>
          <InputNumber style={{ width: '100%' }} value={newBuyCondition.value} onChange={(v) => setNewBuyCondition({...newBuyCondition, value: v || 0})} />
        </div>
      </Modal>

      {/* 添加卖出条件弹窗 */}
      <Modal title="添加卖出条件" open={isSellModalOpen} onOk={handleAddSellCondition} onCancel={() => setIsSellModalOpen(false)}>
        <div className="condition-form-item">
          <label>选择因子：</label>
          <Select style={{ width: '100%' }} value={newSellCondition.factor} onChange={(v) => setNewSellCondition({...newSellCondition, factor: v})}>
            {ALL_FACTORS.map(f => <Option key={f.value} value={f.value}>{f.label}</Option>)}
          </Select>
        </div>
        <div className="condition-form-item">
          <label>比较符：</label>
          <Select style={{ width: '100%' }} value={newSellCondition.operator} onChange={(v) => setNewSellCondition({...newSellCondition, operator: v})}>
            {OPERATORS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
          </Select>
        </div>
        <div className="condition-form-item">
          <label>值：</label>
          <InputNumber style={{ width: '100%' }} value={newSellCondition.value} onChange={(v) => setNewSellCondition({...newSellCondition, value: v || 0})} />
        </div>
      </Modal>
    </div>
  )
}

export default StrategyConfig
