import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, ChefHat, HeartHandshake } from 'lucide-react';

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Gluten / Wheat',
  'Dairy / Lactose',
  'Soy',
  'Eggs',
  'Shellfish',
  'Fish'
];

const SAMPLE_RECIPES = [
  {
    name: "Creamy Chicken Pesto Pasta",
    text: "Ingredients:\n- 200g penne pasta\n- 150g chicken breast\n- 3 tbsp traditional basil pesto (contains pine nuts, parmesan cheese)\n- 100ml heavy cream\n- 2 cloves garlic\n- 2 tbsp olive oil\n- Grated parmesan for garnish"
  },
  {
    name: "Classic Asian Beef Stir Fry",
    text: "Ingredients:\n- 300g flank steak sliced\n- 3 tbsp regular soy sauce\n- 1 tbsp toasted sesame oil\n- 1 tbsp oyster sauce\n- 1 tsp cornstarch\n- 1 bell pepper\n- 1 cup broccoli florets\n- Crushed roasted peanuts for garnish"
  }
];

export default function App() {
  const [friendName, setFriendName] = useState('Alex');
  const [selectedAllergies, setSelectedAllergies] = useState(['Peanuts', 'Dairy / Lactose']);
  const [customAllergy, setCustomAllergy] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const toggleAllergy = (allergy) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter(a => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const addCustomAllergy = (e) => {
    e.preventDefault();
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies([...selectedAllergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const handleAnalyze = async () => {
    if (!recipeText.trim()) {
      alert("Please enter recipe ingredients or load an example!");
      return;
    }
    if (selectedAllergies.length === 0) {
      alert("Please select at least one allergy or restriction.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friend_name: friendName,
          allergies: selectedAllergies,
          recipe_text: recipeText
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze recipe. Please ensure Docker containers are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="badge">
          <HeartHandshake size={16} />
          Built for a Friend • Powered by Gemma 2
        </div>
        <h1>AllerGuard</h1>
        <p>Private, offline recipe allergy scanner & ingredient substitute engine</p>
      </header>

      {/* Profile & Allergies Card */}
      <div className="card">
        <div className="form-group">
          <label>Who are you cooking for?</label>
          <input
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            placeholder="Friend or roommate's name"
          />
        </div>

        <div className="form-group">
          <label>Their Known Allergies & Sensitivities:</label>
          <div className="tag-container">
            {COMMON_ALLERGIES.map((allergy) => (
              <span
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`allergy-chip ${selectedAllergies.includes(allergy) ? 'active' : ''}`}
              >
                {selectedAllergies.includes(allergy) ? '✓ ' : '+ '}
                {allergy}
              </span>
            ))}
          </div>

          <form onSubmit={addCustomAllergy} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <input
              type="text"
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              placeholder="Add other (e.g. Sesame, Mustard)"
              style={{ flex: 1 }}
            />
            <button type="submit" className="allergy-chip active" style={{ padding: '0 1rem' }}>
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Recipe Input Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label style={{ margin: 0 }}>Recipe or Ingredients List:</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {SAMPLE_RECIPES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="allergy-chip"
                onClick={() => setRecipeText(sample.text)}
              >
                Load {sample.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={6}
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste recipe ingredients, restaurant menu item, or meal prep notes here..."
        />

        <div style={{ marginTop: '1.25rem' }}>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Gemma 2 is analyzing ingredients...
              </>
            ) : (
              <>
                <ChefHat size={20} />
                Analyze Recipe for {friendName}
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Analysis Results Card */}
      {result && (
        <div className="card">
          <div className={`result-banner ${result.is_safe ? 'safe' : 'danger'}`}>
            {result.is_safe ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {result.is_safe ? 'Recipe is Safe to Cook!' : `Allergen Warning for ${friendName}`}
              </h2>
              <p style={{ marginTop: '0.25rem', opacity: 0.9 }}>{result.summary}</p>
            </div>
          </div>

          {result.hazards && result.hazards.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#ef4444" />
                Detected Hazards & Safe Substitutions
              </h3>

              {result.hazards.map((item, idx) => (
                <div key={idx} className="hazard-item">
                  <div className="hazard-title">
                    <span>{item.ingredient}</span>
                    <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {item.risk_level} RISK
                    </span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{item.reason}</p>
                  
                  <div className="substitute-box">
                    <strong>Safe Swap: </strong> {item.safe_substitute}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.safe_recipe_modifications && (
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
                Kitchen Prep & Cross-Contamination Advice:
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
                {result.safe_recipe_modifications}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}