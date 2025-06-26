const fs = require('fs');
const path = require('path');

class DiaryManager {
  constructor() {
    this.diaryPath = path.join(__dirname, '..', 'diary');
    this.moodStatsPath = path.join(this.diaryPath, 'mood-stats.json');
    this.highlightsPath = path.join(this.diaryPath, 'highlights.md');
  }

  // 新しい日記エントリーを作成
  createEntry(mood, topic) {
    const date = new Date();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthDir = path.join(this.diaryPath, `${yearMonth}-entries`);
    
    // ディレクトリ作成
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true });
    }

    const fileName = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${dayStr}-${topic}.md`;
    const filePath = path.join(monthDir, fileName);

    const template = `# ${date.toISOString().split('T')[0]} - ${topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

## 🎭 今日の気分: ${mood}

### ${new Date().toTimeString().split(' ')[0]} - セッション開始

*ユーザーからの依頼:*
「」

*私の第一印象:*


### 進行中...


### 今日の学び


### 明日への一言


---
感情タグ: #
難易度: ★☆☆☆☆
コーヒー消費量: ☕`;

    fs.writeFileSync(filePath, template);
    console.log(`📝 日記エントリーを作成しました: ${filePath}`);
    
    // 感情統計を更新
    this.updateMoodStats(mood);
  }

  // 感情統計を更新
  updateMoodStats(mood) {
    let stats = {};
    if (fs.existsSync(this.moodStatsPath)) {
      stats = JSON.parse(fs.readFileSync(this.moodStatsPath, 'utf8'));
    }

    const date = new Date().toISOString().split('T')[0];
    if (!stats.daily) stats.daily = {};
    if (!stats.summary) stats.summary = {};
    if (!stats.moodCount) stats.moodCount = {};

    // 日別記録
    stats.daily[date] = mood;

    // 感情カウント
    stats.moodCount[mood] = (stats.moodCount[mood] || 0) + 1;

    // サマリー更新
    stats.summary = {
      totalEntries: Object.keys(stats.daily).length,
      lastEntry: date,
      mostCommonMood: Object.entries(stats.moodCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || mood,
      moodDistribution: stats.moodCount
    };

    fs.writeFileSync(this.moodStatsPath, JSON.stringify(stats, null, 2));
  }

  // 日記を検索
  searchDiary(keyword) {
    const results = [];
    const diaryDir = this.diaryPath;
    
    const searchInDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && file.includes('-entries')) {
          searchInDir(filePath);
        } else if (file.endsWith('.md')) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            const lines = content.split('\n');
            const matchingLines = lines.filter(line => 
              line.toLowerCase().includes(keyword.toLowerCase())
            );
            results.push({
              file: path.relative(this.diaryPath, filePath),
              matches: matchingLines.slice(0, 3)
            });
          }
        }
      });
    };

    searchInDir(diaryDir);
    return results;
  }

  // 感情統計を表示
  showMoodStats() {
    if (!fs.existsSync(this.moodStatsPath)) {
      console.log('📊 まだ感情統計がありません');
      return;
    }

    const stats = JSON.parse(fs.readFileSync(this.moodStatsPath, 'utf8'));
    
    if (!stats.summary || Object.keys(stats).length === 0) {
      console.log('📊 まだ感情統計がありません');
      return;
    }

    console.log('\n📊 開発感情統計\n');
    console.log(`総エントリー数: ${stats.summary.totalEntries}`);
    console.log(`最終更新: ${stats.summary.lastEntry}`);
    console.log(`最も多い感情: ${stats.summary.mostCommonMood}`);
    console.log('\n感情分布:');
    Object.entries(stats.moodCount || {}).forEach(([mood, count]) => {
      const bar = '█'.repeat(count);
      console.log(`${mood}: ${bar} (${count})`);
    });
  }

  // ハイライトに追加
  addHighlight(text, category = 'quote') {
    const date = new Date().toISOString().split('T')[0];
    const highlight = `\n### ${date} - ${category}\n${text}\n`;
    
    if (!fs.existsSync(this.highlightsPath)) {
      fs.writeFileSync(this.highlightsPath, '# 開発日記ハイライト集\n\n## 名言・愚痴・気づき\n');
    }
    
    fs.appendFileSync(this.highlightsPath, highlight);
    console.log('✨ ハイライトに追加しました');
  }
}

// CLI実装
const command = process.argv[2];
const diary = new DiaryManager();

switch (command) {
  case 'new':
    const mood = process.argv[3] || '😐';
    const topic = process.argv[4] || 'general-development';
    diary.createEntry(mood, topic);
    break;
    
  case 'search':
    const keyword = process.argv[3];
    if (!keyword) {
      console.log('❌ 検索キーワードを指定してください');
      break;
    }
    const results = diary.searchDiary(keyword);
    if (results.length === 0) {
      console.log('🔍 該当する日記エントリーが見つかりませんでした');
    } else {
      results.forEach(result => {
        console.log(`\n📄 ${result.file}`);
        result.matches.forEach(match => console.log(`  > ${match}`));
      });
    }
    break;
    
  case 'stats':
    diary.showMoodStats();
    break;
    
  case 'highlight':
    const text = process.argv.slice(3).join(' ');
    if (!text) {
      console.log('❌ ハイライトするテキストを指定してください');
      break;
    }
    diary.addHighlight(text);
    break;
    
  default:
    console.log(`
🎭 AI開発日記マネージャー

使い方:
  node diary-manager.cjs new [感情絵文字] [トピック]
    例: node diary-manager.cjs new 😤 typescript-struggle
    
  node diary-manager.cjs search [キーワード]
    例: node diary-manager.cjs search "型エラー"
    
  node diary-manager.cjs stats
    感情統計を表示
    
  node diary-manager.cjs highlight [テキスト]
    名言や愚痴をハイライトに追加
    例: node diary-manager.cjs highlight "TypeScriptは友達。ツンデレな友達"
    `);
}