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
  Switch,
  Input,
  Tabs
} from 'antd'
import {
  PlayCircleOutlined,
  SettingOutlined,
  FilterOutlined,
  BarChartOutlined,
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import './StrategyConfig.css'

const { Text } = Typography
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
  value: number | string
  unit?: string
  enabled?: boolean
}

// 可选因子列表 - 禄得网完整版
const AVAILABLE_FACTORS = [
  { 
    category: '基础因子', 
    factors: [
      { value: 'option_value', label: '期权价值' },
      { value: 'theory_deviation', label: '理论偏离度' },
      { value: 'double_low', label: '双低' },
      { value: 'turnover', label: '换手率' },
      { value: 'bond_yield', label: '可转债收益率' },
      { value: 'remaining_size', label: '剩余规模(亿)' },
      { value: 'close_price', label: '收盘价' },
      { value: 'premium_rate', label: '转股溢价率' },
      { value: 'issue_size', label: '发行规模(亿)' },
      { value: 'convert_premium', label: '转股溢价率' },
      { value: 'remaining_market_value', label: '剩余市值(亿)' },
      { value: 'pure_bond_value', label: '纯债价值' },
      { value: 'maturity_price', label: '到期价' },
      { value: 'turnover_amount', label: '成交额(万)' },
      { value: 'low_price', label: '最低价' },
      { value: 'high_price', label: '最高价' },
      { value: 'remaining_years', label: '剩余年限' },
      { value: 'open_price', label: '开盘价' },
      { value: 'convert_value', label: '转股价值' },
      { value: 'list_days', label: '上市天数' },
      { value: 'redeem_trigger_count', label: '强赎触发计数' },
      { value: 'redeem_countdown', label: '强赎触发倒计时' },
    ]
  },
  { 
    category: '历史类因子', 
    factors: [
      { value: 'price_change_5d', label: '5日涨跌幅' },
      { value: 'amplitude_5d', label: '5日振幅' },
      { value: 'hist_volatility', label: '历史波动率' },
      { value: 'price_change_20d', label: '20日涨跌幅' },
      { value: 'price_change_60d', label: '60日涨跌幅' },
      { value: 'turnover_5d', label: '5日换手率' },
      { value: 'turnover_20d', label: '20日换手率' },
    ]
  },
  { 
    category: '正股相关因子', 
    factors: [
      { value: 'stock_price_change_5d', label: '正股5日涨跌幅' },
      { value: 'stock_price_change_20d', label: '正股20日涨跌幅' },
      { value: 'stock_market_cap', label: '正股市值' },
      { value: 'stock_pe', label: '正股PE' },
      { value: 'stock_pb', label: '正股PB' },
      { value: 'stock_turnover', label: '正股换手率' },
      { value: 'stock_volatility', label: '正股波动率' },
    ]
  },
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

// 排除因子专用选项
const EXCLUDE_FACTORS = [
  { value: 'redeem_status', label: '赎回状态', type: 'select', options: ['已满足强赎条件', '公告强赎', '不强赎'] },
  { value: 'is_st', label: 'ST状态', type: 'select', options: ['是', '否'] },
  { value: 'list_days', label: '上市天数', type: 'number' },
  { value: 'company_type', label: '企业类型', type: 'select', options: ['国有企业', '民营企业', '外资企业', '集体企业'] },
  { value: 'province', label: '地域', type: 'select', options: ['北京', '上海', '广东', '浙江', '江苏', '黑龙江'] },
  { value: 'third_party_rating', label: '三方评级', type: 'select', options: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A'] },
  { value: 'industry', label: '行业', type: 'select', options: ['金融', '地产', '医药', '科技', '消费', '制造'] },
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

  // 排除因子（表格形式 - 禄得网样式）
  const [excludeConditions, setExcludeConditions] = useState<Condition[]>([
    { id: '1', factor: 'redeem_status', operator: '=', value: '已满足强赎条件', enabled: true },
    { id: '2', factor: 'is_st', operator: '=', value: '是', enabled: true },
    { id: '3', factor: 'list_days', operator: '<', value: 10, enabled: false },
  ])
  const [isExcludeModalOpen, setIsExcludeModalOpen] = useState(false)
  const [newExcludeCondition, setNewExcludeCondition] = useState<Partial<Condition>>({
    factor: 'redeem_status',
    operator: '=',
    value: '已满足强赎条件',
  })

  const handleStartBacktest = () => {
    const values = form.getFieldsValue()
    const fullConfig = { 
      ...DEFAULT_BASE_CONFIG, 
      ...values, 
      scoreFactors,
      buyConditions,
      sellConditions,
      excludeConditions
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
        id: (Date.now() + index).toString(),
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

  // 排除因子相关
  const handleAddExcludeCondition = () => {
    if (newExcludeCondition.factor && newExcludeCondition.operator && newExcludeCondition.value !== undefined) {
      const condition: Condition = {
        id: Date.now().toString(),
        factor: newExcludeCondition.factor,
        operator: newExcludeCondition.operator,
        value: newExcludeCondition.value,
        enabled: true,
      }
      setExcludeConditions([...excludeConditions, condition])
      setIsExcludeModalOpen(false)
    }
  }

  const handleDeleteExcludeCondition = (id: string) => {
    setExcludeConditions(excludeConditions.filter(c => c.id !== id))
  }

  const handleToggleExclude = (id: string, enabled: boolean) => {
    setExcludeConditions(excludeConditions.map(c => 
      c.id === id ? { ...c, enabled } : c
    ))
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
      render: (value: any) => value
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

  // 排除因子表格列
  const excludeColumns = [
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 60,
      render: (enabled: boolean, record: Condition) => (
        <Checkbox checked={enabled} onChange={(e) => handleToggleExclude(record.id, e.target.checked)} />
      ),
    },
    {
      title: '因子',
      dataIndex: 'factor',
      key: 'factor',
      render: (factor: string) => EXCLUDE_FACTORS.find(f => f.value === factor)?.label || factor
    },
    {
      title: '比较符',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (op: string) => OPERATORS.find(o => o.value === op)?.label || op
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (value: any) => value
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_: any, record: Condition) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteExcludeCondition(record.id)} />
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
            {/* 买入条件 */}
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
          </div>

          {/* 右侧：排除因子 + 卖出条件 */}
          <div className="strategy-right">
            {/* 排除因子 - 禄得网样式表格 */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><FilterOutlined /> 排除因子</span>
                  <Button type="link" size="small" onClick={() => setIsExcludeModalOpen(true)}>添加排除条件</Button>
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
              {excludeConditions.length === 0 ? (
                <div className="empty-state">
                  暂无排除条件，点击"添加排除条件"
                </div>
              ) : (
                <Table
                  dataSource={excludeConditions}
                  columns={excludeColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>

            {/* 卖出条件 */}
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
            style={{ width: '240px', height: '50px', fontSize: '18px' }}
          >
            开始回测
          </Button>
        </div>
      </Form>

      {/* 添加打分因子弹窗 - 禄得网样式 */}
      <Modal 
        title="添加打分因子" 
        open={isFactorModalOpen} 
        onOk={handleFactorModalOk} 
        onCancel={() => setIsFactorModalOpen(false)} 
        width={800}
        okText="确定"
        cancelText="取消"
      >
        {/* 已选因子 */}
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <Text strong style={{ marginRight: '8px' }}>已选因子：</Text>
          {selectedFactors.length === 0 ? (
            <Text type="secondary">请选择下方因子</Text>
          ) : (
            selectedFactors.map(factor => (
              <Tag key={factor} closable onClose={() => setSelectedFactors(selectedFactors.filter(f => f !== factor))} style={{ marginBottom: '4px' }}>
                {factor}
              </Tag>
            ))
          )}
        </div>
        
        {/* 搜索框 */}
        <Input.Search 
          placeholder="搜索因子" 
          style={{ marginBottom: '16px' }} 
          onChange={(e) => {
            // 搜索功能可以后续实现
            console.log('搜索:', e.target.value)
          }}
        />
        
        {/* 分类标签页 */}
        <Tabs defaultActiveKey="基础因子" items={
          AVAILABLE_FACTORS.map(category => ({
            key: category.category,
            label: category.category,
            children: (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {category.factors.map(factor => (
                  <Button
                    key={factor.value}
                    type={selectedFactors.includes(factor.label) ? 'primary' : 'default'}
                    size="middle"
                    style={{ minWidth: '100px', marginBottom: '8px' }}
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
            )
          }))
        } />
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
          <InputNumber style={{ width: '100%' }} value={newBuyCondition.value as number} onChange={(v) => setNewBuyCondition({...newBuyCondition, value: v || 0})} />
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
          <InputNumber style={{ width: '100%' }} value={newSellCondition.value as number} onChange={(v) => setNewSellCondition({...newSellCondition, value: v || 0})} />
        </div>
      </Modal>

      {/* 添加排除因子弹窗 */}
      <Modal title="添加排除条件" open={isExcludeModalOpen} onOk={handleAddExcludeCondition} onCancel={() => setIsExcludeModalOpen(false)}>
        <div className="condition-form-item">
          <label>选择因子：</label>
          <Select 
            style={{ width: '100%' }} 
            value={newExcludeCondition.factor} 
            onChange={(v) => {
              const factor = EXCLUDE_FACTORS.find(f => f.value === v)
              setNewExcludeCondition({
                ...newExcludeCondition, 
                factor: v,
                value: factor?.type === 'select' ? factor.options?.[0] : 0
              })
            }}
          >
            {EXCLUDE_FACTORS.map(f => <Option key={f.value} value={f.value}>{f.label}</Option>)}
          </Select>
        </div>
        <div className="condition-form-item">
          <label>比较符：</label>
          <Select style={{ width: '100%' }} value={newExcludeCondition.operator} onChange={(v) => setNewExcludeCondition({...newExcludeCondition, operator: v})}>
            {OPERATORS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
          </Select>
        </div>
        <div className="condition-form-item">
          <label>值：</label>
          {(() => {
            const factor = EXCLUDE_FACTORS.find(f => f.value === newExcludeCondition.factor)
            if (factor?.type === 'select') {
              return (
                <Select style={{ width: '100%' }} value={newExcludeCondition.value as string} onChange={(v) => setNewExcludeCondition({...newExcludeCondition, value: v})}>
                  {factor.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                </Select>
              )
            }
            return <InputNumber style={{ width: '100%' }} value={newExcludeCondition.value as number} onChange={(v) => setNewExcludeCondition({...newExcludeCondition, value: v || 0})} />
          })()}
        </div>
      </Modal>
    </div>
  )
}

export default StrategyConfig
