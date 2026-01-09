import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Code, DollarSign, FileText, Loader, ShieldAlert, X, Upload as UploadIcon, UploadCloud, Save, RotateCcw, Trash2, Plus, Info } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';

interface Suggestion {
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
}

const Upload: React.FC = () => {
  const [sql, setSql] = useState('');
  const [description, setDescription] = useState('');
  const [manualCost, setManualCost] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [hasPII, setHasPII] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhance syntax highlighting for BigQuery specifics on mount
  useEffect(() => {
    if (Prism && Prism.languages.sql) {
      // Add BigQuery specific types and functions to the SQL grammar if possible
      // This is a lightweight extension to standard SQL highlighting
      Prism.languages.sql['type'] = /\b(?:INT64|FLOAT64|NUMERIC|BIGNUMERIC|STRING|BYTES|BOOL|DATE|DATETIME|TIME|TIMESTAMP|STRUCT|ARRAY|GEOGRAPHY|JSON)\b/i;
      Prism.languages.sql['builtin'] = /\b(?:CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME|SESSION_USER|GENERATE_UUID)\b/i;
    }
  }, []);

  // Load draft check on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('query_draft');
    if (savedDraft && savedDraft.trim() !== '') {
      setHasDraft(true);
    }
  }, []);

  // Auto-save draft logic
  useEffect(() => {
    // Don't auto-save if there's a pending draft (hasDraft=true) to avoid overwriting it.
    // Only save if the user has loaded/discarded the draft (hasDraft=false) AND sql is not empty.
    if (hasDraft) return;

    const timer = setTimeout(() => {
      if (sql.trim()) {
        localStorage.setItem('query_draft', sql);
        setLastSaved(new Date());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [sql, hasDraft]);

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('query_draft');
    if (savedDraft) {
      setSql(savedDraft);
      setHasDraft(false); // Draft is now loaded, normal auto-save resumes
      setLastSaved(new Date());
    }
  };

  const discardDraft = () => {
    localStorage.removeItem('query_draft');
    setHasDraft(false); // Draft removed, normal auto-save resumes
    setLastSaved(null);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSql(event.target.result as string);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we are truly leaving the container,
    // not just entering a child element.
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const generateSuggestions = (sqlText: string): Suggestion[] => {
    const tips: Suggestion[] = [];
    const lower = sqlText.toLowerCase();

    // 1. SELECT *
    if (lower.includes('select *')) {
      tips.push({
        type: 'warning',
        title: 'Avoid SELECT *',
        message: 'Explicitly listing columns reduces data processed and lowers costs in BigQuery.'
      });
    }

    // 2. Missing Filters
    if (!lower.includes('where') && !lower.includes('limit')) {
      tips.push({
        type: 'warning',
        title: 'Missing Constraints',
        message: 'No WHERE or LIMIT clause detected. This query might scan full tables.'
      });
    }

    // 3. Join Structure
    if (lower.includes('join') && !lower.includes('on') && !lower.includes('using')) {
      tips.push({
        type: 'warning',
        title: 'Join Structure',
        message: 'JOIN detected without standard ON/USING clause. Ensure join conditions are correct.'
      });
    }

    // 4. Partitioning
    if (lower.includes('partition') || lower.includes('_partitiondate')) {
      tips.push({
        type: 'success',
        title: 'Partitioning Used',
        message: 'Great job using partition filters to optimize query performance.'
      });
    }

    // 5. Leading Wildcards (New)
    if (/like\s+['"]%/.test(lower)) {
      tips.push({
        type: 'warning',
        title: 'Leading Wildcard',
        message: 'Using % at the start of a LIKE pattern prevents efficient index usage.'
      });
    }

    // 6. Approx Count (New)
    if (/count\s*\(\s*distinct/.test(lower)) {
      tips.push({
        type: 'info',
        title: 'Approximate Count',
        message: 'For massive datasets, consider APPROX_COUNT_DISTINCT() to reduce cost and latency.'
      });
    }
    
    // 7. Unbounded Order By (New)
    if (lower.includes('order by') && !lower.includes('limit')) {
      tips.push({
        type: 'warning',
        title: 'Unbounded Sort',
        message: 'Ordering without a LIMIT can be resource-intensive on large tables.'
      });
    }

    if (tips.length === 0) {
      tips.push({
        type: 'success',
        title: 'Structure Looks Good',
        message: 'No obvious anti-patterns detected in static analysis.'
      });
    }

    return tips;
  };

  const handleAnalysis = () => {
    if (!sql) return;
    setAnalyzing(true);
    setAnalysisComplete(false);
    setSuggestedTags([]);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisComplete(true);
      
      // Smart Tag Detection
      const lowerSql = sql.toLowerCase();
      const detected: string[] = [];
      
      if (lowerSql.includes('revenue') || lowerSql.includes('price') || lowerSql.includes('amount')) detected.push('revenue');
      if (lowerSql.includes('user') || lowerSql.includes('customer_id') || lowerSql.includes('profile')) detected.push('users');
      if (lowerSql.includes('churn') || lowerSql.includes('inactive') || lowerSql.includes('cancel')) detected.push('churn');
      if (lowerSql.includes('date') || lowerSql.includes('timestamp')) detected.push('time-series');
      if (lowerSql.includes('join')) detected.push('complex-join');
      if (lowerSql.includes('partition')) detected.push('partitioned');
      if (lowerSql.includes('marketing') || lowerSql.includes('campaign') || lowerSql.includes('utm_')) detected.push('marketing');

      // Update suggested tags
      setSuggestedTags(detected.filter(t => !tags.includes(t)));

      // Add 'auto-detected' tag automatically if not present
      if (!tags.includes('auto-detected')) {
         setTags(prev => [...prev, 'auto-detected']);
      }

      // Detect PII with stricter logic
      // Check for exact table names or PII keywords with word boundaries
      const piiPatterns = [
        /users\.pii_data/i,
        /\b(ssn|social_security|passport_number)\b/i,
        /\b(email|phone_number|mobile)\b/i,
        /\b(password|hash|salt)\b/i,
        /\b(credit_card|cc_number|cvv)\b/i
      ];
      
      const foundPII = piiPatterns.some(pattern => pattern.test(sql));
      setHasPII(foundPII);

      // Generate actionable suggestions
      setSuggestions(generateSuggestions(sql));
    }, 1500);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      
      const newTags = currentTag
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '' && !tags.includes(tag));
        
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
      setCurrentTag('');
    }
  };

  const acceptSuggestion = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Safe syntax highlighting fallback
  const highlightCode = (code: string) => {
    if (Prism && Prism.languages && Prism.languages.sql) {
      return Prism.highlight(code, Prism.languages.sql, 'sql');
    }
    // Fallback if SQL definition isn't loaded
    return code; 
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 h-full flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Ingest Query</h1>
          <p className="text-gray-400 text-sm">Paste SQL or upload a file. We'll handle the metadata.</p>
        </div>
        <div className="flex gap-3">
          {hasDraft && (
            <div className="flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-md p-1 pr-2 animate-in fade-in slide-in-from-top-2">
              <span className="text-xs text-primary-400 pl-2 font-medium">Draft Found</span>
              <div className="h-4 w-px bg-dark-600 mx-1"></div>
              <button 
                onClick={loadDraft}
                className="flex items-center gap-1 text-gray-300 hover:text-white text-xs px-2 py-1 rounded hover:bg-dark-700 transition-colors"
              >
                <RotateCcw size={12} /> Resume
              </button>
              <button 
                onClick={discardDraft}
                className="flex items-center gap-1 text-gray-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-dark-700 transition-colors"
              >
                <Trash2 size={12} /> Discard
              </button>
            </div>
          )}
          <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-lg shadow-primary-900/20">
            Publish Query
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Column: Input */}
        <div className="flex flex-col gap-4 h-full">
          <div 
            className={`bg-dark-800 rounded-lg border flex-1 flex flex-col overflow-hidden transition-all relative ${
              isDragging ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-dark-600 focus-within:ring-1 focus-within:ring-primary-500/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag Overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-50 bg-dark-900/95 flex flex-col items-center justify-center cursor-copy backdrop-blur-sm pointer-events-none">
                <div className="bg-dark-800 p-8 rounded-full mb-4 border border-primary-500/30 animate-bounce">
                  <UploadCloud size={48} className="text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Drop SQL file here</h3>
                <p className="text-gray-400">We'll insert the content for you</p>
              </div>
            )}

            <div className="bg-dark-900 border-b border-dark-600 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">SQL Editor (BigQuery)</span>
              <div className="flex gap-3 items-center">
                 {!hasDraft && lastSaved && (
                    <span className="text-xs text-gray-500 flex items-center gap-1 transition-opacity duration-1000">
                      <Save size={10} /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                 )}
                 {!hasDraft && !lastSaved && sql && (
                    <span className="text-xs text-gray-500 flex items-center gap-1 animate-pulse">
                      <Save size={10} /> Auto-saving...
                    </span>
                 )}
                 <div className="w-px h-3 bg-dark-700"></div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileUpload} 
                   className="hidden" 
                   accept=".sql" 
                 />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                 >
                   <UploadIcon size={12} />
                   Upload .sql
                 </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-dark-900 relative">
              <Editor
                value={sql}
                onValueChange={code => setSql(code)}
                highlight={highlightCode}
                padding={16}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 14,
                  backgroundColor: 'transparent',
                  color: '#e2e8f0',
                  minHeight: '100%'
                }}
                textareaClassName="focus:outline-none"
              />
              {sql === '' && (
                <div className="absolute top-4 left-4 text-gray-500 pointer-events-none font-mono text-sm">
                  -- Paste your BigQuery SQL here...
                  <br />
                  SELECT * FROM `project.dataset.table`
                </div>
              )}
            </div>
          </div>
          
          <textarea 
            placeholder="Describe the business logic, assumptions, or 'gotchas' before analyzing..." 
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white h-24 resize-none focus:border-primary-500 outline-none transition-colors"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button 
            onClick={handleAnalysis}
            disabled={!sql || analyzing}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              sql ? 'bg-accent-500 hover:bg-accent-400 text-white' : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {analyzing ? <Loader className="animate-spin" size={18} /> : <ZapIcon />}
            {analyzing ? 'Analyzing Schema & Lineage...' : 'Analyze SQL'}
          </button>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="bg-dark-800 rounded-lg border border-dark-600 p-6 flex flex-col gap-6 overflow-y-auto">
          {!analysisComplete && !analyzing && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
              <Code size={48} className="mb-4" />
              <p>Waiting for SQL input...</p>
            </div>
          )}

          {analyzing && (
             <div className="h-full flex flex-col items-center justify-center text-accent-400">
               <div className="w-full max-w-xs bg-dark-700 h-2 rounded-full overflow-hidden mb-4">
                 <div className="h-full bg-accent-500 animate-pulse w-2/3"></div>
               </div>
               <p className="text-sm font-mono">Detecting datasets...</p>
               <p className="text-sm font-mono mt-1 text-gray-500">Calculating cost estimate...</p>
             </div>
          )}

          {analysisComplete && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Flags Section */}
              <div className="grid grid-cols-2 gap-3">
                {hasPII ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-3">
                    <ShieldAlert className="text-red-400" size={20} />
                    <div>
                      <h4 className="text-red-400 font-bold text-sm">PII Detected</h4>
                      <p className="text-xs text-red-300/70">Accesses sensitive data</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <div>
                      <h4 className="text-green-400 font-bold text-sm">Safe Query</h4>
                      <p className="text-xs text-green-300/70">No PII detected</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex items-center gap-3">
                  <DollarSign className="text-yellow-400" size={20} />
                  <div>
                    <h4 className="text-yellow-400 font-bold text-sm">Moderate Cost</h4>
                    <p className="text-xs text-yellow-300/70">Est. ~$1.20 / run</p>
                  </div>
                </div>
              </div>

              {/* Detected Metadata */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Auto-Detected Context</h3>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Target Tables</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-dark-700 rounded text-xs text-primary-300 border border-primary-900/50">adreens-prod.finance</span>
                      <span className="px-2 py-1 bg-dark-700 rounded text-xs text-primary-300 border border-primary-900/50">adreens-prod.users</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Dialect</span>
                    <div className="flex items-center gap-2">
                      <img src="https://www.vectorlogo.zone/logos/google_bigquery/google_bigquery-icon.svg" className="w-4 h-4" alt="BQ" />
                      <span className="text-sm text-white">Google BigQuery (Standard SQL)</span>
                    </div>
                  </div>
                  {/* Manual Cost Input */}
                  <div className="flex flex-col pt-2">
                     <span className="text-xs text-gray-500 mb-1">Manual Cost Estimate (Optional)</span>
                     <div className="relative">
                       <DollarSign size={14} className="absolute left-3 top-2.5 text-gray-500" />
                       <input 
                         type="text" 
                         placeholder="e.g. 0.50" 
                         className="w-full bg-dark-900 border border-dark-600 rounded px-3 pl-8 py-2 text-white text-sm focus:border-primary-500 outline-none transition-colors"
                         value={manualCost}
                         onChange={(e) => setManualCost(e.target.value)}
                       />
                     </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                 <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Optimization Tips</h3>
                 <div className="bg-dark-900 p-4 rounded-lg border border-dark-600 space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        {suggestion.type === 'warning' && <AlertTriangle className="text-orange-400 shrink-0" size={16} />}
                        {suggestion.type === 'success' && <CheckCircle className="text-green-400 shrink-0" size={16} />}
                        {suggestion.type === 'info' && <Info className="text-blue-400 shrink-0" size={16} />}
                        <div>
                           <p className={`text-sm font-bold ${
                             suggestion.type === 'warning' ? 'text-orange-400' : 
                             suggestion.type === 'success' ? 'text-green-400' : 'text-blue-400'
                           }`}>
                             {suggestion.title}
                           </p>
                           <p className="text-sm text-gray-300">{suggestion.message}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* User Metadata Form */}
              <div className="pt-4 border-t border-dark-600">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Human Context</h3>
                <input 
                  type="text" 
                  placeholder="Give this query a clear title..." 
                  className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-white mb-3 focus:border-primary-500 outline-none transition-colors"
                />
                
                {/* Tag Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span key={tag} className="bg-dark-700 text-primary-300 px-2 py-1 rounded-md text-sm flex items-center gap-1 border border-dark-600 group hover:border-primary-500/50 transition-colors">
                        <span className="select-none text-primary-500/50">#</span>{tag}
                        <button 
                          onClick={() => removeTag(tag)} 
                          className="ml-1 text-gray-500 hover:text-white rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add tags (separated by comma or Enter)..." 
                    className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-white focus:border-primary-500 outline-none transition-colors text-sm"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  
                  {/* Dynamic Suggestions */}
                  {suggestedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs text-gray-500 py-1">Suggested:</span>
                      {suggestedTags.map(tag => (
                        <button 
                          key={tag} 
                          onClick={() => acceptSuggestion(tag)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-accent-500/10 text-accent-400 border border-accent-500/20 hover:bg-accent-500/20 transition-colors"
                        >
                          <Plus size={10} />
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">Separated by comma (e.g. revenue, q4, critical)</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

export default Upload;