import React, { useEffect, useMemo, useState } from 'react'
import './Admin.css'
import {
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	BarChart,
	Bar
} from 'recharts'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

function formatDate(date) {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

const defaultFrom = () => {
	const d = new Date()
	d.setDate(d.getDate() - 13)
	return formatDate(d)
}

const defaultTo = () => formatDate(new Date())

const AnalyticsDashboard = () => {
	const [from, setFrom] = useState(defaultFrom())
	const [to, setTo] = useState(defaultTo())
	const [gameType, setGameType] = useState('') // 전체

	const [dailyData, setDailyData] = useState([])
	const [wrongTop, setWrongTop] = useState([])
	const [multiRank, setMultiRank] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		let aborted = false
		async function run() {
			setLoading(true)
			setError('')
			try {
				const qs = (obj) => Object.entries(obj).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
				const [dRes, wRes, mRes] = await Promise.all([
					fetch(`${API_BASE}/admin/stats/daily-plays?${qs({ from, to })}`),
					fetch(`${API_BASE}/admin/stats/wrong-top?${qs({ from, to, gameType, limit: 10 })}`),
					fetch(`${API_BASE}/admin/stats/multi-ranking?${qs({ from, to, gameType })}`)
				])
				if (!aborted) {
					const [d, w, m] = await Promise.all([dRes.json(), wRes.json(), mRes.json()])
					setDailyData(Array.isArray(d) ? d : [])
					setWrongTop(Array.isArray(w) ? w : [])
					setMultiRank(Array.isArray(m) ? m : [])
				}
			} catch (err) {
				if (!aborted) setError('데이터를 불러오지 못했습니다.')
			} finally {
				if (!aborted) setLoading(false)
			}
		}
		run()
		return () => { aborted = true }
	}, [from, to, gameType])

	const dailySeries = useMemo(() => {
		const byDate = new Map()
		for (const row of dailyData) {
			const key = row.date
			const cur = byDate.get(key) || { date: key, oxquiz: 0, block: 0, card: 0, blank: 0 }
			cur[row.gameType] = row.count
			byDate.set(key, cur)
		}
		return Array.from(byDate.values()).sort((a,b) => a.date.localeCompare(b.date))
	}, [dailyData])

	const wrongTopData = useMemo(() => wrongTop.map(r => ({
		name: `${r.game_type}#${r.question_id}`,
		wrong: r.wrong_count
	})), [wrongTop])

	const rankData = useMemo(() => {
		// group by user_rank
		const map = new Map()
		for (const r of multiRank) {
			const k = String(r.user_rank)
			map.set(k, (map.get(k) || 0) + Number(r.count || 0))
		}
		const arr = Array.from(map.entries()).map(([rank, count]) => ({ rank, count }))
		return arr.sort((a,b) => Number(a.rank) - Number(b.rank))
	}, [multiRank])

	return (
		<div>
			<div className="admin-controls">
				<label className="admin-label">기간(from)
					<input className="admin-input" type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ marginLeft: 6 }} />
				</label>
				<label className="admin-label">기간(to)
					<input className="admin-input" type="date" value={to} onChange={e => setTo(e.target.value)} style={{ marginLeft: 6 }} />
				</label>
				<label className="admin-label">게임
					<select className="admin-select" value={gameType} onChange={e => setGameType(e.target.value)} style={{ marginLeft: 6 }}>
						<option value="">전체</option>
						<option value="oxquiz">oxquiz</option>
						<option value="block">block</option>
						<option value="card">card</option>
						<option value="blank">blank</option>
					</select>
				</label>
			</div>

			{error && <div className="admin-error">{error}</div>}
			{loading && <div className="admin-loading">로딩 중...</div>}

			<div className="admin-panel">
				<h3 className="admin-card-title">일자별 플레이 수</h3>
				<div className="admin-chart">
					<ResponsiveContainer>
						<LineChart data={dailySeries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#333" />
							<XAxis dataKey="date" stroke="#aaa" />
							<YAxis stroke="#aaa" allowDecimals={false} />
							<Tooltip />
							<Legend />
							<Line type="monotone" dataKey="oxquiz" stroke="#8884d8" dot={false} />
							<Line type="monotone" dataKey="block" stroke="#82ca9d" dot={false} />
							<Line type="monotone" dataKey="card" stroke="#ffc658" dot={false} />
							<Line type="monotone" dataKey="blank" stroke="#ff7300" dot={false} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="admin-panel">
				<h3 className="admin-card-title">오답 상위 10개</h3>
				<div className="admin-chart">
					<ResponsiveContainer>
						<BarChart data={wrongTopData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#333" />
							<XAxis dataKey="name" stroke="#aaa" angle={-25} textAnchor="end" interval={0} height={60} />
							<YAxis stroke="#aaa" allowDecimals={false} />
							<Tooltip />
							<Bar dataKey="wrong" fill="#ff7373" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="admin-panel">
				<h3 className="admin-card-title">멀티플레이 순위 분포</h3>
				<div className="admin-chart small">
					<ResponsiveContainer>
						<BarChart data={rankData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#333" />
							<XAxis dataKey="rank" stroke="#aaa" />
							<YAxis stroke="#aaa" allowDecimals={false} />
							<Tooltip />
							<Bar dataKey="count" fill="#82ca9d" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsDashboard


