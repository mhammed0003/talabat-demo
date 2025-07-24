import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);

  // تحديد معلومات المستخدمين
  const userProfiles = {
    hr_specialist: {
      name: 'سارة أحمد',
      role: 'أخصائي الموارد البشرية',
      avatar: 'س',
      color: '#4CAF50'
    },
    hr_manager: {
      name: 'أحمد محمد',
      role: 'مدير الموارد البشرية',
      avatar: 'أ',
      color: '#2196F3'
    },
    committee_member: {
      name: 'فاطمة علي',
      role: 'عضو اللجنة',
      avatar: 'ف',
      color: '#FF9800'
    },
    authority_holder: {
      name: 'محمد خالد',
      role: 'صاحب الصلاحية',
      avatar: 'م',
      color: '#9C27B0'
    },
    system_admin: {
      name: 'عبدالله سعد',
      role: 'مدير النظام',
      avatar: 'ع',
      color: '#F44336'
    }
  };

  // جلب البيانات من الخادم
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const statsResponse = await fetch(`https://p9hwiqclwg1v.manus.space/api/dashboard/${user.username}`);
      const statsData = await statsResponse.json();
      setStats(statsData);

      const requestsResponse = await fetch('https://p9hwiqclwg1v.manus.space/api/requests');
      const requestsData = await requestsResponse.json();
      setRequests(requestsData.requests || []);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://p9hwiqclwg1v.manus.space/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        const userProfile = userProfiles[username];
        setUser({
          username,
          ...userProfile,
          role_permissions: data.user.role_permissions
        });
      } else {
        alert('خطأ في تسجيل الدخول');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      alert('خطأ في الاتصال بالخادم');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setStats({});
    setRequests([]);
  };

  const handleAction = async (action, requestId = null) => {
    try {
      let url = 'https://p9hwiqclwg1v.manus.space/api/requests';
      let method = 'POST';
      let body = {};

      if (requestId && action !== 'create') {
        url += `/${requestId}/action`;
        body = { action };
      } else if (action === 'create') {
        body = {
          type: action.split('_')[1] || 'general',
          title: `طلب ${action}`,
          description: `تفاصيل الطلب`,
          amount: action.includes('salary') ? 5000 : null
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchUserData(); // إعادة تحميل البيانات
        alert('تم تنفيذ العملية بنجاح');
      }
    } catch (error) {
      console.error('خطأ في تنفيذ العملية:', error);
    }
  };

  // شاشة تسجيل الدخول
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-background-pattern"></div>
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">🏛️</div>
              <h1 className="login-title">نظام الموافقات</h1>
            </div>
            <p className="login-subtitle">منصة إدارة الموافقات الإلكترونية</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">اسم المستخدم</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="login-button">
              <span className="button-icon">🚀</span>
              تسجيل الدخول
            </button>
          </form>
          
          <div className="demo-accounts">
            <div className="demo-header">
              <span className="demo-icon">🔑</span>
              <h3 className="demo-title">حسابات تجريبية</h3>
            </div>
            <div className="demo-grid">
              {Object.entries(userProfiles).map(([key, profile]) => (
                <div 
                  key={key}
                  className="demo-account" 
                  onClick={() => {
                    setUsername(key);
                    setPassword('password123');
                  }}
                >
                  <div className="demo-avatar" style={{backgroundColor: profile.color}}>
                    {profile.avatar}
                  </div>
                  <div className="demo-info">
                    <div className="demo-role">{profile.role}</div>
                    <div className="demo-username">{key}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="demo-note">
              <span className="note-icon">💡</span>
              كلمة المرور لجميع الحسابات: password123
            </div>
          </div>
        </div>
      </div>
    );
  }

  // الشاشة الرئيسية
  return (
    <div className="app">
      <div className="dashboard">
        <header className="header">
          <div className="header-content">
            <h1 className="header-title">نظام الموافقات</h1>
            <div className="user-info">
              <div className="user-avatar" style={{backgroundColor: user.color}}>
                {user.avatar}
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <button onClick={handleLogout} className="logout-button">
                <span className="logout-icon">🚪</span>
                تسجيل الخروج
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          {/* الإحصائيات */}
          <section className="stats-section">
            <h2 className="section-title">
              <span className="title-icon">📊</span>
              الإحصائيات
            </h2>
            <div className="stats-grid">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">
                      {key.includes('rejected') ? '❌' : 
                       key.includes('approved') ? '✅' : 
                       key.includes('pending') ? '⏳' : '📈'}
                    </div>
                    <div className="stat-trend">
                      <span className="trend-arrow">↗️</span>
                    </div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-title">
                      {key === 'rejected_requests' ? 'الطلبات المرفوضة' :
                       key === 'approval_rate' ? 'معدل الموافقة' :
                       key === 'pending_requests' ? 'الطلبات المعلقة' :
                       key === 'monthly_requests' ? 'طلبات هذا الشهر' :
                       key === 'review_requests' ? 'طلبات المراجعة' :
                       key === 'avg_review_time' ? 'متوسط وقت المراجعة' :
                       key === 'overdue_requests' ? 'الطلبات المتأخرة' :
                       key === 'committee_requests' ? 'طلبات اللجنة' :
                       key === 'pending_recommendations' ? 'التوصيات المعلقة' :
                       key === 'past_recommendations' ? 'التوصيات السابقة' :
                       key === 'final_decision_requests' ? 'طلبات القرار النهائي' :
                       key === 'total_decisions' ? 'إجمالي القرارات' :
                       key === 'committee_disagreement' ? 'مخالفة توصية اللجنة' :
                       key === 'avg_decision_time' ? 'متوسط وقت القرار' :
                       key === 'total_users' ? 'إجمالي المستخدمين' :
                       key === 'active_requests' ? 'الطلبات النشطة' :
                       key === 'system_status' ? 'حالة النظام' :
                       key === 'sap_integration' ? 'تكامل SAP' : key}
                    </div>
                    <div className="stat-value">
                      {typeof value === 'string' && value.includes('%') ? value :
                       typeof value === 'string' ? value :
                       typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
                    </div>
                    <div className="stat-change positive">
                      +12% من الشهر الماضي
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* الأزرار والإجراءات */}
          <section className="actions-section">
            <h2 className="section-title">
              <span className="title-icon">⚡</span>
              الإجراءات السريعة
            </h2>
            <div className="action-buttons">
              {user.username === 'hr_specialist' && (
                <>
                  <button className="action-button primary" onClick={() => handleAction('create_salary')}>
                    <span className="action-icon">💰</span>
                    <div className="action-content">
                      <div className="action-title">زيادة راتب</div>
                      <div className="action-desc">طلب زيادة راتب جديد</div>
                    </div>
                  </button>
                  <button className="action-button" onClick={() => handleAction('create_travel')}>
                    <span className="action-icon">✈️</span>
                    <div className="action-content">
                      <div className="action-title">رحلة عمل</div>
                      <div className="action-desc">طلب رحلة عمل</div>
                    </div>
                  </button>
                  <button className="action-button" onClick={() => handleAction('create_hiring')}>
                    <span className="action-icon">👥</span>
                    <div className="action-content">
                      <div className="action-title">تعيين</div>
                      <div className="action-desc">طلب تعيين موظف</div>
                    </div>
                  </button>
                  <button className="action-button" onClick={() => handleAction('create_overtime')}>
                    <span className="action-icon">⏰</span>
                    <div className="action-content">
                      <div className="action-title">عمل إضافي</div>
                      <div className="action-desc">طلب عمل إضافي</div>
                    </div>
                  </button>
                </>
              )}

              {user.username === 'system_admin' && (
                <>
                  <button className="action-button primary">
                    <span className="action-icon">👥</span>
                    <div className="action-content">
                      <div className="action-title">إدارة المستخدمين</div>
                      <div className="action-desc">إضافة وتعديل المستخدمين</div>
                    </div>
                  </button>
                  <button className="action-button">
                    <span className="action-icon">⚙️</span>
                    <div className="action-content">
                      <div className="action-title">إعدادات النظام</div>
                      <div className="action-desc">تكوين النظام العام</div>
                    </div>
                  </button>
                  <button className="action-button">
                    <span className="action-icon">🏢</span>
                    <div className="action-content">
                      <div className="action-title">شعار المؤسسة</div>
                      <div className="action-desc">رفع وتحديث الشعار</div>
                    </div>
                  </button>
                  <button className="action-button">
                    <span className="action-icon">📊</span>
                    <div className="action-content">
                      <div className="action-title">التقارير</div>
                      <div className="action-desc">تقارير الأداء والنشاط</div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </section>

          {/* الطلبات */}
          <section className="requests-section">
            <h2 className="section-title">
              <span className="title-icon">📋</span>
              {user.username === 'hr_specialist' ? 'طلباتي المرسلة' :
               user.username === 'hr_manager' ? 'الطلبات للمراجعة' :
               user.username === 'committee_member' ? 'طلبات اللجنة' :
               user.username === 'authority_holder' ? 'طلبات القرار النهائي' :
               'جميع الطلبات'}
            </h2>
            <div className="requests-grid">
              {requests.length > 0 ? requests.map((request, index) => (
                <div key={index} className="request-card">
                  <div className="request-header">
                    <div className="request-info">
                      <h3 className="request-type">{request.type}</h3>
                      <p className="request-submitter">{request.submitter}</p>
                    </div>
                    <div className={`request-status status-${request.status}`}>
                      {request.status === 'pending' ? 'معلق' :
                       request.status === 'approved' ? 'موافق عليه' :
                       request.status === 'rejected' ? 'مرفوض' : request.status}
                    </div>
                  </div>
                  
                  <div className="request-details">
                    <p>{request.description}</p>
                    {request.amount && (
                      <div className="request-amount">
                        <span className="amount-label">المبلغ:</span>
                        <span className="amount-value">{request.amount.toLocaleString('ar-SA')} ريال</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="request-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span className="meta-text">{request.date}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🏢</span>
                      <span className="meta-text">{request.department}</span>
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    <button className="request-button btn-details">
                      <span className="btn-icon">👁️</span>
                      عرض التفاصيل
                    </button>
                    
                    {user.username === 'hr_manager' && request.status === 'pending' && (
                      <>
                        <button 
                          className="request-button btn-approve"
                          onClick={() => handleAction('approve', request.id)}
                        >
                          <span className="btn-icon">✅</span>
                          موافقة
                        </button>
                        <button 
                          className="request-button btn-reject"
                          onClick={() => handleAction('reject', request.id)}
                        >
                          <span className="btn-icon">❌</span>
                          رفض
                        </button>
                        <button className="request-button btn-modify">
                          <span className="btn-icon">✏️</span>
                          طلب تعديل
                        </button>
                      </>
                    )}
                    
                    {user.username === 'committee_member' && (
                      <>
                        <button 
                          className="request-button btn-approve"
                          onClick={() => handleAction('recommend_approve', request.id)}
                        >
                          <span className="btn-icon">👍</span>
                          أوصي بالموافقة
                        </button>
                        <button 
                          className="request-button btn-reject"
                          onClick={() => handleAction('recommend_reject', request.id)}
                        >
                          <span className="btn-icon">👎</span>
                          أوصي بالرفض
                        </button>
                      </>
                    )}
                    
                    {user.username === 'authority_holder' && (
                      <>
                        <button 
                          className="request-button btn-approve"
                          onClick={() => handleAction('final_approve', request.id)}
                        >
                          <span className="btn-icon">✅</span>
                          موافقة نهائية
                        </button>
                        <button 
                          className="request-button btn-reject"
                          onClick={() => handleAction('final_reject', request.id)}
                        >
                          <span className="btn-icon">❌</span>
                          رفض نهائي
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3 className="empty-title">لا توجد طلبات</h3>
                  <p className="empty-description">لم يتم العثور على أي طلبات في الوقت الحالي</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

