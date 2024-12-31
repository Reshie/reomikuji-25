import { useState } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState(1);
  const [wish, setWish] = useState("");
  const [omen, setOmen] = useState("");
  const [fortune, setFortune] = useState<string | undefined>("");
  // const fortune = "大吉";

  const API_URL = import.meta.env.VITE_API_URL;

  const fortune_good = [
    { name: "大吉", weight: 0.5},
    { name: "中吉", weight: 0.3},
    { name: "吉", weight: 0.2},
  ];
  const fortune_bad = [
    { name: "吉", weight: 0.4},
    { name: "小吉", weight: 0.3},
    { name: "凶", weight: 0.2},
    { name: "大凶", weight: 0.1},
  ];

  const handleRequestOmen = async () => {
    if (!wish) {
      alert('願い事を入力してください');
      return;
    }
  
    setStep(2);
  
    // 3秒待つPromiseを作成
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  
    try {
      // APIリクエストと3秒の待機を並行して実行
      const [response] = await Promise.all([
        fetch(`${API_URL}/api`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: wish }),
        }),
        delay(5000),
      ]);
  
      if (!response.ok) {
        throw new Error(`HTTP error. status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data.response);
  
      setOmen(data.response);
      console.log(data.is_serious);
      setFortune(getFortune(data.is_serious));
      setStep(3);
  
      return data.response;

    } catch (error) {
      console.error('APIの取得に失敗しました。', error);
      alert('お告げが聞こえませんでした。もう一度お願いしてみてください。');
      reset();
      return;
    }
  };  

  const getFortune = (isSerious: boolean) => {
    const fortunes = isSerious ? fortune_good : fortune_bad;

    console.log(fortunes);
    
    const random = Math.random();

    let cumulativeWeight = 0;
    for (const fortune of fortunes) {
      cumulativeWeight += fortune.weight;
      if (random < cumulativeWeight) {
        return fortune.name;
      }
    }
  }

  const reset = () => {
    setStep(1);
    setWish('');
    setOmen('');
    setFortune('');
  }

  const redirectToLink = (url: string) => {
    window.open(url, '_blank');
  }

  const share = async () => {
    try {
      await navigator.share({
        title: 'れおみくじ2025',
        text: `神は言っている...「${omen}」と...`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('シェアに失敗しました。', error);
    }
  }

  return (
    <div className={`app step-${step}`}>
      <div className={`rays ${fortune === "凶" || fortune === "大凶" ? "bad-fortune" : "good-fortune"}`}></div>
      <img id='god' src='./kamisama.png' alt='神はここにいる...'></img>

      {/* 入力 */}
      {step === 1 && (
        <div className="input-screen">
          <h1 className='title'>
            わしは神であるぞ。<br />
            願い事を言いなさい。
          </h1>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="願い事を入力...(30文字以内)"
          />
          <button
            onClick={handleRequestOmen}
            disabled={wish.length < 1 || wish.length > 30}
          >
            お願いする！
          </button>
        </div>
      )}

      {/* API待ち */}
      {step === 2 && (
        <div className="loading-screen">
          <p>お願いしています...</p>
        </div>
      )}

      {/* API完了 */}
      {step === 3 && (
        <div className="complete-screen">
          <button onClick={() => setStep(4)}>おみくじを引く</button>
        </div>
      )}

      {/* 結果表示 */}
      {step === 4 && (
        <div className="result-screen">
          <div className="result-card">
            <p className='title'>れおみくじ</p>
            <p className='fortune'>{fortune}</p>
            <div className="omen-card">
              <p className='omen-title'>神のお告げ</p>
              <p className='omen'>{omen}</p>
              <p className='wish'>──{wish}</p>
            </div>
            <div className="buttons">
              <div>
                <button onClick={() => redirectToLink('https://buymeacoffee.com/reo_ogura')}>お賽銭を入れる</button>
                <button onClick={() => share()}>シェアする</button>
              </div>
              <button onClick={() => reset()}>もう一度引く</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
