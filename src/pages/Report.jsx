import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { reportsApi } from '../api/reports';
import '../css/report.css';

export default function Report() {
  const [selectedDate, setSelectedDate] = useState('May 20, 2024 - Jun 19, 2024');
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('Report generated successfully.');
  const [toastVisible, setToastVisible] = useState(false);
  const [generatingReportId, setGeneratingReportId] = useState(null);
  const [isGeneratingMain, setIsGeneratingMain] = useState(false);
  const dateWrapperRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateWrapperRef.current && !dateWrapperRef.current.contains(event.target)) {
        setDateMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const createFileName = (name) => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") + ".txt"
    );
  };

  const downloadTextFile = (content, fileName) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setDateMenuOpen(false);
    showToast("Date range updated successfully.");
  };

  const handleGenerateMain = async () => {
    showToast("Generating report...");
    setIsGeneratingMain(true);
    try {
      const res = await reportsApi.generateReport({
        reportName: 'HireIQ Comprehensive Hiring Report',
        dateRange: selectedDate,
      });
      setIsGeneratingMain(false);
      if (res?.data?.content) {
        downloadTextFile(res.data.content, res.data.fileName || 'hireiq-hiring-report.txt');
        showToast('Report generated successfully.');
      }
    } catch (err) {
      setIsGeneratingMain(false);
      showToast(err.message || 'Failed to generate report.');
    }
  };

  const handleGenerateRow = async (reportName) => {
    setGeneratingReportId(reportName);
    try {
      const res = await reportsApi.generateReport({
        reportName,
        dateRange: selectedDate,
      });
      setGeneratingReportId(null);
      if (res?.data?.content) {
        downloadTextFile(res.data.content, res.data.fileName || createFileName(reportName));
        showToast(`${reportName} generated successfully.`);
      }
    } catch (err) {
      setGeneratingReportId(null);
      showToast(err.message || 'Failed to generate report.');
    }
  };

  return (
    <>
      <Sidebar activePage="report" />

      {/* Main Content */}
      <main className="main-content report-main">
        {/* Reports Page */}
        <div className="reports-page">
          {/* Page Header */}
          <Header
            title="Reports"
            subtitle="Export reports and track hiring performance."
          >
            <div className="header-controls">
              <div className="date-wrapper" ref={dateWrapperRef}>
                <button
                  type="button"
                  className="date-selector"
                  id="dateSelector"
                  onClick={() => setDateMenuOpen(!dateMenuOpen)}
                >
                  <span>
                    <i className="fa-regular fa-calendar"></i>
                    <span id="selectedDate">{selectedDate}</span>
                  </span>
                  <i className="fa-solid fa-chevron-down"></i>
                </button>

                <div
                  className={`date-menu ${dateMenuOpen ? 'show' : ''}`}
                  id="dateMenu"
                >
                  <button
                    type="button"
                    className="date-option"
                    onClick={() => handleDateSelect('May 20, 2024 - Jun 19, 2024')}
                  >
                    May 20, 2024 - Jun 19, 2024
                  </button>
                  <button
                    type="button"
                    className="date-option"
                    onClick={() => handleDateSelect('Apr 20, 2024 - May 19, 2024')}
                  >
                    Apr 20, 2024 - May 19, 2024
                  </button>
                  <button
                    type="button"
                    className="date-option"
                    onClick={() => handleDateSelect('Mar 20, 2024 - Apr 19, 2024')}
                  >
                    Mar 20, 2024 - Apr 19, 2024
                  </button>
                  <button
                    type="button"
                    className="date-option"
                    onClick={() => handleDateSelect('Last 30 Days')}
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    className="date-option"
                    onClick={() => handleDateSelect('Last 90 Days')}
                  >
                    Last 90 Days
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="generate-btn"
                id="generateReport"
                disabled={isGeneratingMain}
                onClick={handleGenerateMain}
              >
                <i className="fa-solid fa-plus"></i>
                Generate Report
              </button>
            </div>
          </Header>

          {/* Available Reports */}
          <section className="reports-card">
            <div className="reports-card-header">
              <h2>Available Reports</h2>
            </div>

            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {/* Candidate Summary */}
                  <tr>
                    <td>
                      <div className="report-name">
                        <div className="report-icon blue">
                          <i className="fa-solid fa-users"></i>
                        </div>
                        <strong>Candidate Summary Report</strong>
                      </div>
                    </td>
                    <td>
                      <span className="report-description">
                        Overview of all candidates and their current status.
                      </span>
                    </td>
                    <td>
                      <div className="report-actions">
                        <button
                          type="button"
                          className="report-btn"
                          data-report="Candidate Summary Report"
                          disabled={generatingReportId === 'Candidate Summary Report'}
                          onClick={() => handleGenerateRow('Candidate Summary Report')}
                        >
                          {generatingReportId === 'Candidate Summary Report' ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i> Generating...
                            </>
                          ) : (
                            <>
                              Generate <i className="fa-solid fa-download"></i>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Hiring Performance */}
                  <tr>
                    <td>
                      <div className="report-name">
                        <div className="report-icon green">
                          <i className="fa-solid fa-chart-line"></i>
                        </div>
                        <strong>Hiring Performance Report</strong>
                      </div>
                    </td>
                    <td>
                      <span className="report-description">
                        Detailed hiring performance and time to hire metrics.
                      </span>
                    </td>
                    <td>
                      <div className="report-actions">
                        <button
                          type="button"
                          className="report-btn"
                          data-report="Hiring Performance Report"
                          disabled={generatingReportId === 'Hiring Performance Report'}
                          onClick={() => handleGenerateRow('Hiring Performance Report')}
                        >
                          {generatingReportId === 'Hiring Performance Report' ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i> Generating...
                            </>
                          ) : (
                            <>
                              Generate <i className="fa-solid fa-download"></i>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Interview Funnel */}
                  <tr>
                    <td>
                      <div className="report-name">
                        <div className="report-icon purple">
                          <i className="fa-solid fa-filter"></i>
                        </div>
                        <strong>Interview Funnel Report</strong>
                      </div>
                    </td>
                    <td>
                      <span className="report-description">
                        Interview funnel conversion and drop-off analysis.
                      </span>
                    </td>
                    <td>
                      <div className="report-actions">
                        <button
                          type="button"
                          className="report-btn"
                          data-report="Interview Funnel Report"
                          disabled={generatingReportId === 'Interview Funnel Report'}
                          onClick={() => handleGenerateRow('Interview Funnel Report')}
                        >
                          {generatingReportId === 'Interview Funnel Report' ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i> Generating...
                            </>
                          ) : (
                            <>
                              Generate <i className="fa-solid fa-download"></i>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Source Effectiveness */}
                  <tr>
                    <td>
                      <div className="report-name">
                        <div className="report-icon orange">
                          <i className="fa-solid fa-bullseye"></i>
                        </div>
                        <strong>Source Effectiveness Report</strong>
                      </div>
                    </td>
                    <td>
                      <span className="report-description">
                        Performance analysis of candidate sources.
                      </span>
                    </td>
                    <td>
                      <div className="report-actions">
                        <button
                          type="button"
                          className="report-btn"
                          data-report="Source Effectiveness Report"
                          disabled={generatingReportId === 'Source Effectiveness Report'}
                          onClick={() => handleGenerateRow('Source Effectiveness Report')}
                        >
                          {generatingReportId === 'Source Effectiveness Report' ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i> Generating...
                            </>
                          ) : (
                            <>
                              Generate <i className="fa-solid fa-download"></i>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Toast */}
      <div
        className={`toast ${toastVisible ? 'show' : ''}`}
        id="toast"
        style={{ display: toastVisible ? 'flex' : 'none' }}
      >
        <i className="fa-solid fa-circle-check"></i>
        <span id="toastMessage">{toastMessage}</span>
      </div>
    </>
  );
}
