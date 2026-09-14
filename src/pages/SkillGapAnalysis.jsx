import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../css/skillgapanalysis.css';

export default function SkillGapAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const initialGaps = [
    {
      id: 'aws',
      skill: 'AWS',
      category: 'tools',
      categoryLabel: 'Tools & Frameworks',
      required: '80%',
      candidateAvg: '35%',
      severityClass: 'high',
      severityLabel: 'High gap',
      severityPercent: '45%',
      iconClass: 'table-icon cloud',
      iconFa: 'fa-brands fa-aws',
    },
    {
      id: 'docker',
      skill: 'Docker',
      category: 'tools',
      categoryLabel: 'Tools & Frameworks',
      required: '70%',
      candidateAvg: '30%',
      severityClass: 'high',
      severityLabel: 'High gap',
      severityPercent: '40%',
      iconClass: 'table-icon docker',
      iconFa: 'fa-brands fa-docker',
    },
    {
      id: 'kubernetes',
      skill: 'Kubernetes',
      category: 'technical',
      categoryLabel: 'Technical Skills',
      required: '70%',
      candidateAvg: '25%',
      severityClass: 'high',
      severityLabel: 'High gap',
      severityPercent: '45%',
      iconClass: 'table-icon kubernetes',
      iconFa: 'fa-solid fa-cubes',
    },
    {
      id: 'system-design',
      skill: 'System Design',
      category: 'technical',
      categoryLabel: 'Technical Skills',
      required: '60%',
      candidateAvg: '20%',
      severityClass: 'medium',
      severityLabel: 'Medium gap',
      severityPercent: '40%',
      iconClass: 'table-icon design',
      iconFa: 'fa-solid fa-diagram-project',
    },
    {
      id: 'industry-knowledge',
      skill: 'Industry Knowledge',
      category: 'domain',
      categoryLabel: 'Domain Knowledge',
      required: '65%',
      candidateAvg: '42%',
      severityClass: 'medium',
      severityLabel: 'Medium gap',
      severityPercent: '23%',
      iconClass: 'table-icon domain',
      iconFa: 'fa-solid fa-briefcase',
    },
  ];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const filteredGaps = initialGaps.filter((item) => {
    const matchesSearch =
      item.skill.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      item.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const content = [
      'HIREIQ SKILL GAP ANALYSIS',
      '=========================',
      'Overall readiness: 72%',
      'Priority focus: Cloud & DevOps, System Design, Communication',
      '',
      ...filteredGaps.map(
        (g) =>
          `${g.skill} | ${g.categoryLabel} | Required: ${g.required} | Avg: ${g.candidateAvg} | Gap: ${g.severityPercent}`
      ),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hireiq-skill-gap-analysis.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    triggerToast('Skill gap analysis exported successfully.');
  };

  const handleRowAction = (skill) => {
    triggerToast(`Learning plan for ${skill} is ready to review.`);
  };

  return (
    <>
      <Sidebar activePage="skillgapanalysis" />

      <main className="main-content">
        <Header
          title="Skill Gap Analysis"
          subtitle="See where your talent pool is strongest and where focused growth can unlock better matches."
        >
          <button
            className="primary-button"
            id="exportAnalysis"
            type="button"
            onClick={handleExport}
          >
            <i className="fa-solid fa-download"></i> Export Analysis
          </button>
        </Header>

        <section className="hero-grid">
          <div className="readiness-panel panel">
            <div className="section-label">Overall workforce readiness</div>
            <div className="readiness-main">
              <div className="score-ring">
                <strong>72</strong>
                <span>/100</span>
              </div>
              <div>
                <h2>Good foundation</h2>
                <p>
                  Most candidates meet core requirements. Closing the priority
                  gaps could improve hiring fit by <b>18%</b>.
                </p>
                <span className="trend">
                  <i className="fa-solid fa-arrow-trend-up"></i> 6.4% from last
                  month
                </span>
              </div>
            </div>
            <div className="readiness-track">
              <span></span>
            </div>
            <div className="track-labels">
              <span>Needs focus</span>
              <b>72% ready</b>
              <span>Strong</span>
            </div>
          </div>
          <div className="focus-panel panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">Priority focus</span>
                <h2>Where to invest next</h2>
              </div>
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <div className="focus-item">
              <span className="focus-icon cloud">
                <i className="fa-solid fa-cloud"></i>
              </span>
              <div>
                <strong>Cloud & DevOps</strong>
                <small>Most frequent gap across roles</small>
              </div>
              <b>45%</b>
            </div>
            <div className="focus-item">
              <span className="focus-icon design">
                <i className="fa-solid fa-diagram-project"></i>
              </span>
              <div>
                <strong>System Design</strong>
                <small>High impact on senior matches</small>
              </div>
              <b>40%</b>
            </div>
            <div className="focus-item">
              <span className="focus-icon soft">
                <i className="fa-solid fa-comments"></i>
              </span>
              <div>
                <strong>Communication</strong>
                <small>Growing interview signal</small>
              </div>
              <b>28%</b>
            </div>
          </div>
        </section>

        <section className="category-grid">
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon blue">
                <i className="fa-solid fa-code"></i>
              </span>
              <span className="category-change up">+8.2%</span>
            </div>
            <h3>Technical Skills</h3>
            <strong>58%</strong>
            <div className="mini-track">
              <span style={{ width: '58%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon green">
                <i className="fa-solid fa-screwdriver-wrench"></i>
              </span>
              <span className="category-change up">+4.1%</span>
            </div>
            <h3>Tools & Frameworks</h3>
            <strong>64%</strong>
            <div className="mini-track green-track">
              <span style={{ width: '64%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon orange">
                <i className="fa-solid fa-people-group"></i>
              </span>
              <span className="category-change down">-2.6%</span>
            </div>
            <h3>Soft Skills</h3>
            <strong>76%</strong>
            <div className="mini-track orange-track">
              <span style={{ width: '76%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
          <div className="panel category-card">
            <div className="category-top">
              <span className="category-icon violet">
                <i className="fa-solid fa-layer-group"></i>
              </span>
              <span className="category-change up">+3.8%</span>
            </div>
            <h3>Domain Knowledge</h3>
            <strong>49%</strong>
            <div className="mini-track violet-track">
              <span style={{ width: '49%' }}></span>
            </div>
            <p>Average candidate coverage</p>
          </div>
        </section>

        <section className="panel gaps-panel">
          <div className="table-heading">
            <div>
              <span className="section-label">Candidate intelligence</span>
              <h2>Most common skill gaps</h2>
            </div>
            <div className="table-tools">
              <label className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  id="gapSearch"
                  type="search"
                  placeholder="Search skills"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
              <select
                id="gapFilter"
                aria-label="Filter skill gaps"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                <option value="technical">Technical Skills</option>
                <option value="tools">Tools & Frameworks</option>
                <option value="soft">Soft Skills</option>
                <option value="domain">Domain Knowledge</option>
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Required</th>
                  <th>Candidate average</th>
                  <th>Gap severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="gapTable">
                {filteredGaps.map((item) => (
                  <tr key={item.id} data-category={item.category}>
                    <td>
                      <div className="skill-name">
                        <span className={item.iconClass}>
                          <i className={item.iconFa}></i>
                        </span>
                        <strong>{item.skill}</strong>
                      </div>
                    </td>
                    <td>{item.categoryLabel}</td>
                    <td>{item.required}</td>
                    <td>{item.candidateAvg}</td>
                    <td>
                      <span className={`severity ${item.severityClass}`}>
                        {item.severityLabel} <b>{item.severityPercent}</b>
                      </span>
                    </td>
                    <td>
                      <button
                        className="row-action"
                        type="button"
                        data-skill={item.skill}
                        onClick={() => handleRowAction(item.skill)}
                      >
                        View plan <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="empty-state"
            id="emptyState"
            style={{ display: filteredGaps.length === 0 ? 'block' : 'none' }}
          >
            No matching skills found.
          </div>
        </section>
      </main>

      <div
        className={`toast ${showToast ? 'show' : ''}`}
        id="toast"
        role="status"
        style={{ display: showToast ? 'flex' : 'none' }}
      >
        {toastMessage}
      </div>
    </>
  );
}
