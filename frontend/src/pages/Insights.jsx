import React, { useState } from 'react';
import { 
  LineChart, 
  TrendingUp, 
  Clock, 
  PhoneCall, 
  HelpCircle, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  HelpCircle as HelpIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

function Insights() {
  // Simulator State
  const [source, setSource] = useState('Website');
  const [latency, setLatency] = useState(2.0); // in days
  const [followUps, setFollowUps] = useState(2);
  const [dealValue, setDealValue] = useState(500000); // INR
  const [product, setProduct] = useState('Vyana Analytics');

  // Explainability Data
  const featureWeights = [
    { name: 'Lead Source: Referral', weight: 28, type: 'Positive' },
    { name: 'Contact Latency <= 1 Day', weight: 22, type: 'Positive' },
    { name: 'Lead Source: Partner Portal', weight: 20, type: 'Positive' },
    { name: 'Follow-ups >= 5', weight: 18, type: 'Positive' },
    { name: 'Deal Value >= 15L', weight: 10, type: 'Positive' },
    { name: 'Product: AI Lead Intelligence', weight: 8, type: 'Positive' },
    { name: 'Deal Value < 1L', weight: -5, type: 'Negative' },
    { name: 'Lead Source: Cold Call', weight: -15, type: 'Negative' },
  ];

  // Calculate live score
  const calculateScore = () => {
    let base = 35;
    
    // Lead Source drivers
    if (source === 'Referral') base += 28;
    else if (source === 'Partner Portal') base += 20;
    else if (source === 'Website') base += 12;
    else if (source === 'Social Media') base += 5;
    else if (source === 'Cold Call') base -= 15;

    // Contact Latency drivers
    if (latency <= 0.5) base += 25;
    else if (latency <= 1) base += 20;
    else if (latency <= 2) base += 12;
    else if (latency <= 4) base += 5;
    else if (latency > 7) base -= 12;
    else if (latency > 4) base -= 5;

    // Follow-ups drivers
    if (followUps === 0) base -= 15;
    else if (followUps === 1) base -= 5;
    else if (followUps >= 5) base += 18;
    else if (followUps >= 3) base += 10;

    // Deal Value drivers
    const val = parseFloat(dealValue);
    if (val >= 1500000) base += 10;
    else if (val >= 500000) base += 5;
    else if (val < 100000) base -= 5;

    // Product Interest drivers
    if (product === 'AI Lead Intelligence') base += 8;
    else if (product === 'Vyana Analytics') base += 6;
    else if (product === 'Enterprise Cloud') base += 4;

    return Math.max(1, Math.min(99, base));
  };

  const score = calculateScore();

  // Dynamic priority details
  const getPriorityDetails = (val) => {
    if (val >= 75) return { label: 'HIGH PRIORITY', color: 'text-brand-success', bg: 'bg-brand-success/10 border-brand-success/20', dialColor: '#10b981', action: 'Immediate Sales Outreach', desc: 'Direct assigned sales representative to follow up within 4 hours. High probability win candidate.' };
    if (val >= 40) return { label: 'MEDIUM PRIORITY', color: 'text-brand-warning', bg: 'bg-brand-warning/10 border-brand-warning/20', dialColor: '#f59e0b', action: 'Standard Sales Outreach', desc: 'Schedule standard product demo. Representative should contact within 48 hours.' };
    return { label: 'LOW PRIORITY', color: 'text-brand-danger', bg: 'bg-brand-danger/10 border-brand-danger/20', dialColor: '#ef4444', action: 'Automated Drip Campaign', desc: 'Low conversion probability. Shift to automated marketing email nurturing list to reserve agent hours.' };
  };

  const priority = getPriorityDetails(score);

  // SVG Gauge calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Formatting helper
  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${new Intl.NumberFormat('en-IN').format(val)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-650 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Explainable AI (XAI) & Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore the drivers behind our lead prioritization scoring. Simulate hypothetical parameters to see how the neural network calculates conversion probability.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Feature Weights & SHAP Beeswarm */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Chart 1: Global Feature Importance */}
          <div className="glass-card p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold font-outfit text-slate-800 dark:text-white">Global Feature Importance (Neural Network)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Relative feature contribution weights towards positive conversion label</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                   data={featureWeights}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickFormatter={(tick) => `${tick}%`}
                    domain={[-20, 35]}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10} 
                    width={150}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148,163,184,0.05)' }}
                    formatter={(value) => [`${value}% impact`, 'Feature Contribution']}
                  />
                  <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                    {featureWeights.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.weight > 0 ? 'url(#positiveGrad)' : 'url(#negativeGrad)'} 
                      />
                    ))}
                  </Bar>
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="positiveGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="negativeGrad" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visual 2: SHAP Density Beeswarm Plot */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-outfit text-slate-800 dark:text-white">SHAP beeswarm Density Plot</h2>
                <p className="text-xs text-slate-500 mt-0.5">Visual representation of impact distributions across test set data points</p>
              </div>
              
              <div className="flex items-center gap-4 text-[9px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-brand-primary" />
                  <span className="text-slate-500 dark:text-slate-400">LOW FEATURE VALUE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-brand-danger" />
                  <span className="text-slate-500 dark:text-slate-400">HIGH FEATURE VALUE</span>
                </div>
              </div>
            </div>

            {/* Simulated Beeswarm Rendering */}
            <div className="border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-955/40 rounded-2xl p-6 relative">
              
              {/* Vertical center indicator */}
              <div className="absolute top-6 bottom-6 left-[60%] w-0.5 border-r border-dashed border-slate-200 dark:border-white/10 z-0 pointer-events-none" />
              <div className="absolute top-2 left-[60%] -translate-x-1/2 text-[9px] font-bold text-slate-500 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 px-2 uppercase tracking-wide">
                No Impact
              </div>

              <div className="space-y-6 relative z-10 font-mono text-[10px]">
                
                {/* Row 1: Contact Speed */}
                <div className="flex items-center justify-between">
                  <span className="w-36 text-slate-700 dark:text-slate-300 font-semibold truncate">Contact Latency</span>
                  <div className="flex-1 h-8 relative flex items-center">
                    {/* Blue dots (low latency - positive impact) */}
                    <div className="absolute left-[62%] flex gap-1 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_4px_#6366f1]" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/80" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/90" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/70" />
                    </div>
                    {/* Red dots (high latency - negative impact) */}
                    <div className="absolute right-[45%] flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-danger shadow-[0_0_4px_#ef4444]" />
                      <span className="w-2 h-2 rounded-full bg-brand-danger/80" />
                      <span className="w-2 h-2 rounded-full bg-brand-danger/95" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Follow-up Intensity */}
                <div className="flex items-center justify-between">
                  <span className="w-36 text-slate-700 dark:text-slate-300 font-semibold truncate">Follow-up Count</span>
                  <div className="flex-1 h-8 relative flex items-center">
                    {/* Red dots (high follow up - positive impact) */}
                    <div className="absolute left-[65%] flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-danger shadow-[0_0_4px_#ef4444]" />
                      <span className="w-2 h-2 rounded-full bg-brand-danger/90" />
                      <span className="w-2 h-2 rounded-full bg-brand-danger/70" />
                      <span className="w-2 h-2 rounded-full bg-brand-danger/80" />
                    </div>
                    {/* Blue dots (low follow up - negative impact) */}
                    <div className="absolute right-[43%] flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_4px_#6366f1]" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/80" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Lead Source: Referral */}
                <div className="flex items-center justify-between">
                  <span className="w-36 text-slate-700 dark:text-slate-300 font-semibold truncate">Source: Referral</span>
                  <div className="flex-1 h-8 relative flex items-center">
                    {/* Red dots (Referral = True - positive impact) */}
                    <div className="absolute left-[70%] flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-danger shadow-[0_0_4px_#ef4444]" />
                      <span className="w-2 h-2 rounded-full bg-brand-danger/90" />
                    </div>
                    {/* Blue dots (Referral = False - slight negative impact) */}
                    <div className="absolute right-[41%] flex gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-brand-primary/40" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/50" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/60" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Deal Value */}
                <div className="flex items-center justify-between">
                  <span className="w-36 text-slate-700 dark:text-slate-300 font-semibold truncate">Deal Value</span>
                  <div className="flex-1 h-8 relative flex items-center">
                    {/* Red dots (High Deal Value - positive impact) */}
                    <div className="absolute left-[61%] flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-danger shadow-[0_0_4px_#ef4444]" />
                      <span className="w-2 h-2 rounded-full bg-brand-danger/70" />
                    </div>
                    {/* Blue dots (Low Deal value - negative impact) */}
                    <div className="absolute right-[42%] flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_4px_#6366f1]" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/85" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom indicator labels */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-white/5 text-[9px] font-bold text-slate-500">
                <span className="uppercase tracking-wide">← REDUCES PROBABILITY (NEGATIVE SHAP)</span>
                <span className="uppercase tracking-wide">INCREASES PROBABILITY (POSITIVE SHAP) →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Simulator Dial & Parameters */}
        <div className="space-y-8">
          
          <div className="glass-card p-6 space-y-6 relative overflow-hidden">
            {/* Ambient bg glow for priority */}
            <div 
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-500"
              style={{ backgroundColor: `${priority.dialColor}10` }}
            />

            <div>
              <h2 className="text-base font-bold font-outfit text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-primary" />
                Scoring Simulator Playground
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Tweak lead attributes to simulate scoring calculations in real time</p>
            </div>

            {/* SVG Circular Dial */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-200 dark:stroke-slate-900 fill-none"
                    strokeWidth="10"
                  />
                  {/* Animated Score Progress Indicator */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={priority.dialColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                    style={{ filter: `drop-shadow(0 0 4px ${priority.dialColor}40)` }}
                  />
                </svg>

                {/* Score value center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">{score}%</span>
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">CONVERSION</span>
                </div>
              </div>

              {/* Priority Badge */}
              <span className={`text-[9px] font-bold px-3 py-1 mt-4 rounded-full border tracking-wide font-outfit ${priority.bg} ${priority.color}`}>
                {priority.label}
              </span>
            </div>

            {/* Recommended Action Detail Block */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Recommended Action</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{priority.action}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{priority.desc}</p>
            </div>

            {/* Sliders and Controls Form */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/5">
              
              {/* Lead Source Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Lead Source</label>
                  <span className="text-[10px] font-bold text-brand-primary">{source}</span>
                </div>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="glass-input text-xs w-full"
                >
                  <option value="Referral">Referral (+28%)</option>
                  <option value="Partner Portal">Partner Portal (+20%)</option>
                  <option value="Website">Website (+12%)</option>
                  <option value="Social Media">Social Media (+5%)</option>
                  <option value="Cold Call">Cold Call (-15%)</option>
                </select>
              </div>

              {/* Product Interest Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Product Interest</label>
                  <span className="text-[10px] font-bold text-brand-primary">{product}</span>
                </div>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="glass-input text-xs w-full"
                >
                  <option value="AI Lead Intelligence">AI Lead Intelligence (+8%)</option>
                  <option value="Vyana Analytics">Vyana Analytics (+6%)</option>
                  <option value="Enterprise Cloud">Enterprise Cloud (+4%)</option>
                  <option value="Partnership Package">Partnership Package (+0%)</option>
                </select>
              </div>

              {/* Contact Latency Range Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Contact Latency</label>
                  <span className="text-[10px] font-bold text-brand-primary">
                    {latency <= 0.5 ? 'Rapid (<12h)' : `${latency} Days`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={latency}
                  onChange={(e) => setLatency(parseFloat(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer bg-slate-200 dark:bg-slate-900 h-1.5 rounded-lg appearance-none"
                />
                <span className="text-[9px] text-slate-500 italic mt-0.5">
                  Lower response times significantly lift conversion likelihood.
                </span>
              </div>

              {/* Follow-up Count Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Follow-up Outreach</label>
                  <span className="text-[10px] font-bold text-brand-primary">{followUps} touches</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={followUps}
                  onChange={(e) => setFollowUps(parseInt(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer bg-slate-200 dark:bg-slate-900 h-1.5 rounded-lg appearance-none"
                />
              </div>

              {/* Deal Value Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Estimated Deal Value</label>
                  <span className="text-[10px] font-bold text-brand-primary">{formatCurrency(dealValue)}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="3000000"
                  step="50000"
                  value={dealValue}
                  onChange={(e) => setDealValue(parseInt(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer bg-slate-200 dark:bg-slate-900 h-1.5 rounded-lg appearance-none"
                />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Insights;
