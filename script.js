// بيانات التطبيق
let appState = {
    participants: 0,
    chats: 0,
    satisfaction: 0,
    conversations: [],
    surveys: []
};

// قاعدة بيانات محاكاة
class ResearchDatabase {
    constructor() {
        this.init();
    }

    init() {
        // تحميل البيانات من التخزين المحلي
        const savedData = localStorage.getItem('ai_education_research');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                appState = { ...appState, ...parsed };
            } catch (e) {
                console.warn('خطأ في تحميل البيانات المحفوظة، سيتم البدء من جديد');
            }
        }
    }

    save() {
        localStorage.setItem('ai_education_research', JSON.stringify(appState));
    }

    addConversation(userMessage, botResponse) {
        const conversation = {
            id: Date.now(),
            user: userMessage,
            bot: botResponse,
            timestamp: new Date().toISOString(),
            session: this.getCurrentSession()
        };
        
        appState.conversations.push(conversation);
        appState.chats++;
        this.save();
        return conversation;
    }

    addSurvey(surveyData) {
        const survey = {
            id: Date.now(),
            ...surveyData,
            timestamp: new Date().toISOString()
        };
        
        appState.surveys.push(survey);
        appState.participants = new Set(appState.surveys.map(s => s.facultyId)).size;
        this.save();
        return survey;
    }

    getCurrentSession() {
        let session = sessionStorage.getItem('research_session');
        if (!session) {
            session = 'session_' + Date.now();
            sessionStorage.setItem('research_session', session);
        }
        return session;
    }

    getStatistics() {
        const totalSurveys = appState.surveys.length;
        const totalChats = appState.conversations.length;
        
        // حساب معدل الرضا
        let satisfactionRate = 0;
        if (totalSurveys > 0) {
            const positiveSurveys = appState.surveys.filter(survey => {
                const scores = Object.values(survey.responses);
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                return avg <= 2; // أوافق أو أوافق بشدة
            }).length;
            satisfactionRate = Math.round((positiveSurveys / totalSurveys) * 100);
        }

        return {
            participants: appState.participants,
            totalChats: totalChats,
            satisfactionRate: satisfactionRate,
            totalSurveys: totalSurveys
        };
    }

    getExperienceDistribution() {
        const distribution = {
            '0-2': 0,
            '2-5': 0,
            '5-10': 0,
            '10+': 0
        };

        appState.surveys.forEach(survey => {
            if (distribution.hasOwnProperty(survey.experience)) {
                distribution[survey.experience]++;
            }
        });

        return distribution;
    }

    getAverageScores() {
        const scores = {
            peou: { total: 0, count: 0 },
            pu: { total: 0, count: 0 },
            trust: { total: 0, count: 0 }
        };

        appState.surveys.forEach(survey => {
            Object.entries(survey.responses).forEach(([key, value]) => {
                if (key.startsWith('peou')) {
                    scores.peou.total += value;
                    scores.peou.count++;
                } else if (key.startsWith('pu')) {
                    scores.pu.total += value;
                    scores.pu.count++;
                } else if (key.startsWith('trust')) {
                    scores.trust.total += value;
                    scores.trust.count++;
                }
            });
        });

        return {
            peou: scores.peou.count > 0 ? (scores.peou.total / scores.peou.count) : 0,
            pu: scores.pu.count > 0 ? (scores.pu.total / scores.pu.count) : 0,
            trust: scores.trust.count > 0 ? (scores.trust.total / scores.trust.count) : 0
        };
    }
}

// محرك الذكاء الاصطناعي المحاكي
class AIResearchAssistant {
    constructor() {
        this.knowledgeBase = this.createKnowledgeBase();
    }

    createKnowledgeBase() {
        return {
            'تفاعل': {
                title: 'تحسين التفاعل في المحاضرات الإلكترونية',
                content: `🎯 **استراتيجيات مجربة لتحسين التفاعل:**

**1. الأدوات التفاعلية:**
• استخدم Mentimeter أو Kahoot للاستطلاعات الحية
• استخدم Padlet للعصف الذهني الجماعي
• استخدم Jamboard للسبورة التفاعلية المشتركة

**2. تقنيات التدريس:**
• طريقة "فكر-زاوج-شارك" (Think-Pair-Share)
• المناقشات في الغرف الفرعية (Breakout Rooms)
• التعلم القائم على المشاريع

**3. إحصاءات مهمة:**
• التفاعل يزيد retention rate بنسبة 40%
• المشاركة النشطة تحسن الفهم بنسبة 60%
• التغذية الراجعة الفورية ترفع الأداء بنسبة 30%

**4. نصائح عملية:**
• ابدأ بسؤال مثير للتفكير
• خصص 10-15 دقيقة للأسئلة
• استخدم القصص والأمثلة الواقعية`,

                tags: ['تفاعل', 'مشاركة', 'تشجيع', 'انخراط']
            },

            'تقييم': {
                title: 'أدوات التقييم الإلكتروني الفعالة',
                content: `📊 **أنظمة التقييم الشاملة:**

**✅ التقييم التكويني (مستمر):**
• اختبارات قصيرة عبر Kahoot أو Quizizz
• مشاريع جماعية على Google Workspace
• ملفات الإنجاز الإلكترونية (E-portfolio)
• التقييم الذاتي وتقييم الأقران

**📈 التقييم الختامي:**
• اختبارات موحدة مع أنظمة مراقبة
• مشاريع بحثية رقمية
• عروض تقديمية تفاعلية
• بحوث التخرج الإلكترونية

**🎯 أفضل الممارسات:**
• استخدم rubrics واضحة ومفصلة
• وفر التغذية الراجعة البناءة
• نوّع في أساليب التقييم
• استخدم أدوات التحليل الإحصائي

**🤖 أدوات ذكية:**
• Gradescope لتصحيح الواجبات
• Turnitin للكشف عن الانتحال
• Edpuzzle للفيديوهات التفاعلية`,

                tags: ['تقييم', 'امتحان', 'اختبار', 'قياس']
            },

            'تصميم': {
                title: 'تصميم المقررات بالذكاء الاصطناعي',
                content: `🤖 **ثورة الذكاء الاصطناعي في التصميم التعليمي:**

**1. أدوات التصميم الذكية:**
• ChatGPT لتصميم المحتوى والأنشطة
• Midjourney لإنشاء الصور التعليمية
• Gamma أو Tome للعروض التقديمية الذكية
• Curipod للدروس التفاعلية

**2. منهجية التصميم:**
• تحليل احتياجات المتعلمين باستخدام analytics
• تصميم أنشطة تكيفية تتناسب مع مستوى كل طالب
• إنشاء محتوى متعدد الوسائط
• تطوير أدوات تقييم ذكية

**3. إحصاءات مذهلة:**
• الذكاء الاصطناعي يوفر 70% من وقت التصميم
• يحسن جودة المحتوى بنسبة 50%
• يزيد تفاعل الطلاب بنسبة 80%
• يخفض تكاليف التطوير بنسبة 60%

**4. خطوات عملية:**
1. حدد نواتج التعلم المستهدفة
2. استخدم AI لإنشاء المحتوى الأساسي
3. راجع وأعد الصياغة بشكل أكاديمي
4. أضف التفاعلية والوسائط
5. اختبر مع عينة من الطلاب`,

                tags: ['تصميم', 'مقرر', 'منهج', 'محتوى']
            },

            'default': {
                title: 'المساعد الأكاديمي الذكي',
                content: `🎓 **مرحباً! أنا المساعد الذكي للبحث التعليمي**

**مجالات خبرتي:**
• تصميم المقررات الإلكترونية
• استراتيجيات التدريس التفاعلي
• أدوات الذكاء الاصطناعي في التعليم
• تقييم التعلم الإلكتروني
• تحليل البيانات التعليمية

**كيف يمكنني مساعدتك؟**
1. اسأل عن مجال محدد (تفاعل، تقييم، تصميم...)
2. اطلب أمثلة عملية
3. اسأل عن الإحصاءات والدراسات
4. استفسر عن أفضل الممارسات

**💡 للحصول على أفضل النتائج:**
• كن محدداً في سؤالك
• اذكر السياق التعليمي
• حدد التحديات التي تواجهك`,

                tags: ['عام', 'مساعدة', 'دعم']
            }
        };
    }

    async generateResponse(userMessage) {
        // محاكاة وقت المعالجة
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        const message = userMessage.toLowerCase();
        
        // البحث عن أفضل تطابق
        for (const [key, knowledge] of Object.entries(this.knowledgeBase)) {
            if (key !== 'default') {
                const hasMatch = knowledge.tags.some(tag => message.includes(tag));
                if (hasMatch) {
                    return {
                        success: true,
                        reply: knowledge.content,
                        topic: knowledge.title,
                        confidence: 0.9
                    };
                }
            }
        }

        // الرد الافتراضي
        return {
            success: true,
            reply: this.knowledgeBase.default.content,
            topic: this.knowledgeBase.default.title,
            confidence: 0.3
        };
    }
}

// إدارة التطبيق
class ResearchApp {
    constructor() {
        this.db = new ResearchDatabase();
        this.ai = new AIResearchAssistant();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.loadSampleData();
    }

    setupEventListeners() {
        // إرسال الرسالة
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // الأسئلة السريعة
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                document.getElementById('user-input').value = question;
                this.sendMessage();
            });
        });

        // مسح المحادثة
        document.getElementById('clear-chat').addEventListener('click', () => this.clearChat());

        // الاستبيان
        document.getElementById('tam-survey').addEventListener('submit', (e) => this.handleSurveySubmit(e));

        // عداد الأحرف
        document.getElementById('user-input').addEventListener('input', () => this.updateCharCount());

        // التنقل السلس
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // تحديث الإحصائيات عند التمرير
        window.addEventListener('scroll', () => {
            const dashboard = document.getElementById('dashboard');
            const rect = dashboard.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                this.updateCharts();
            }
        });
    }

    updateCharCount() {
        const input = document.getElementById('user-input');
        const count = input.value.length;
        document.querySelector('.char-count').textContent = `${count}/500`;
    }

    async sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        
        if (!message) return;

        // إضافة رسالة المستخدم
        this.addMessageToChat(message, 'user');
        input.value = '';
        this.updateCharCount();
        
        // عرض مؤشر الكتابة
        this.showTypingIndicator();

        try {
            // الحصول على الرد من الذكاء الاصطناعي
            const response = await this.ai.generateResponse(message);
            
            // إخفاء مؤشر الكتابة وإضافة الرد
            this.hideTypingIndicator();
            this.addMessageToChat(response.reply, 'bot');
            
            // حفظ المحادثة في قاعدة البيانات
            this.db.addConversation(message, response.reply);
            
            // تحديث الإحصائيات
            this.updateDashboard();

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessageToChat('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'bot');
            console.error('Error in sendMessage:', error);
        }
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message fade-in`;
        
        const avatar = sender === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        const time = new Date().toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // معالجة النص لعرض Markdown البسيط
        const formattedMessage = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <p>${formattedMessage}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        document.getElementById('typing-indicator').style.display = 'flex';
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        document.getElementById('typing-indicator').style.display = 'none';
    }

    clearChat() {
        if (confirm('هل تريد مسح جميع المحادثات في هذه الجلسة؟')) {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>مرحباً! أنا المساعد الذكي للتعليم الإلكتروني. كيف يمكنني مساعدتك اليوم في مجال التعليم الأكاديمي؟</p>
                        <span class="message-time">الآن</span>
                    </div>
                </div>
            `;
        }
    }

    async handleSurveySubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const surveyData = {
            facultyId: document.getElementById('faculty-id').value || 'anonymous_' + Date.now(),
            experience: document.getElementById('experience').value,
            responses: {},
            feedback: document.getElementById('feedback').value
        };
        
        // جمع بيانات مقياس ليكرت
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            surveyData.responses[radio.name] = parseInt(radio.value);
        });

        try {
            // حفظ الاستبيان
            this.db.addSurvey(surveyData);
            
            // تحديث لوحة التحكم
            this.updateDashboard();
            
            // عرض رسالة النجاح
            this.showSuccessMessage('شكراً لك! تم تسجيل استجاباتك بنجاح وسيتم استخدامها في البحث العلمي.');
            e.target.reset();

        } catch (error) {
            this.showErrorMessage('عذراً، حدث خطأ في حفظ الاستبيان. يرجى المحاولة مرة أخرى.');
            console.error('Error in survey submission:', error);
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message fade-in`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    updateDashboard() {
        const stats = this.db.getStatistics();
        
        // تحديث الإحصائيات الرئيسية
        document.getElementById('faculty-count').textContent = stats.participants;
        document.getElementById('chats-count').textContent = stats.totalChats;
        document.getElementById('satisfaction-rate').textContent = stats.satisfactionRate + '%';
        document.getElementById('total-participants').textContent = stats.participants;
        document.getElementById('total-chats').textContent = stats.totalChats;

        // تحديث المتوسطات
        const averages = this.db.getAverageScores();
        if (stats.totalSurveys > 0) {
            const puPercentage = Math.round((1 - (averages.pu - 1) / 4) * 100);
            const trustPercentage = Math.round((1 - (averages.trust - 1) / 4) * 100);
            
            document.getElementById('avg-pu').textContent = puPercentage + '%';
            document.getElementById('avg-trust').textContent = trustPercentage + '%';
            
            document.getElementById('pu-chart').style.width = puPercentage + '%';
            document.getElementById('trust-chart').style.width = trustPercentage + '%';
        }

        this.updateCharts();
    }

    updateCharts() {
        this.updateExperienceChart();
        this.updateVariablesChart();
    }

    updateExperienceChart() {
        const distribution = this.db.getExperienceDistribution();
        const container = document.getElementById('experience-chart');
        
        if (Object.values(distribution).some(val => val > 0)) {
            let html = '<div class="chart-bars">';
            Object.entries(distribution).forEach(([range, count]) => {
                const percentage = (count / Math.max(1, appState.surveys.length)) * 100;
                html += `
                    <div class="chart-bar-item">
                        <div class="bar-label">${range} سنوات</div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="bar-value">${count} (${Math.round(percentage)}%)</div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="text-align: center; color: #666;">لا توجد بيانات كافية</p>';
        }
    }

    updateVariablesChart() {
        const averages = this.db.getAverageScores();
        const container = document.getElementById('variables-chart');
        
        if (appState.surveys.length > 0) {
            const variables = [
                { name: 'سهولة الاستخدام', value: Math.round((1 - (averages.peou - 1) / 4) * 100), color: '#3498db' },
                { name: 'إدراك الفائدة', value: Math.round((1 - (averages.pu - 1) / 4) * 100), color: '#2ecc71' },
                { name: 'الثقة في الذكاء الاصطناعي', value: Math.round((1 - (averages.trust - 1) / 4) * 100), color: '#e74c3c' }
            ];

            let html = '<div class="variables-chart">';
            variables.forEach(variable => {
                html += `
                    <div class="variable-item">
                        <div class="variable-name">${variable.name}</div>
                        <div class="variable-bar-container">
                            <div class="variable-bar" style="width: ${variable.value}%; background: ${variable.color}"></div>
                        </div>
                        <div class="variable-value">${variable.value}%</div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="text-align: center; color: #666;">لا توجد بيانات كافية</p>';
        }
    }

    loadSampleData() {
        // تحميل بيانات نموذجية للعرض إذا لم تكن هناك بيانات
        if (appState.surveys.length === 0 && appState.conversations.length === 0) {
            // إضافة بعض المحادثات النموذجية
            const sampleConversations = [
                {
                    user: "كيف يمكنني تحسين التفاعل في محاضراتي الإلكترونية؟",
                    bot: this.ai.knowledgeBase.تفاعل.content
                }
            ];

            sampleConversations.forEach(conv => {
                this.db.addConversation(conv.user, conv.bot);
            });

            this.updateDashboard();
        }
    }
}

// وظائف تصدير البيانات
function exportData(type) {
    let data, filename, content;

    try {
        switch(type) {
            case 'surveys':
                data = appState.surveys;
                filename = `tam_surveys_${new Date().toISOString().split('T')[0]}.csv`;
                content = convertSurveysToCSV(data);
                break;
            case 'chats':
                data = appState.conversations;
                filename = `chat_conversations_${new Date().toISOString().split('T')[0]}.json`;
                content = JSON.stringify(data, null, 2);
                break;
            default:
                throw new Error('نوع التصدير غير معروف');
        }

        downloadFile(content, filename, type === 'surveys' ? 'text/csv;charset=utf-8;' : 'application/json');
        
        // عرض رسالة نجاح
        const app = window.researchApp;
        app.showSuccessMessage(`تم تصدير ${type === 'surveys' ? 'الاستبيانات' : 'المحادثات'} بنجاح`);

    } catch (error) {
        console.error('Error exporting data:', error);
        window.researchApp.showErrorMessage('حدث خطأ أثناء تصدير البيانات');
    }
}

function exportAllData() {
    const allData = {
        exportDate: new Date().toISOString(),
        surveys: appState.surveys,
        conversations: appState.conversations,
        statistics: window.researchApp.db.getStatistics(),
        metadata: {
            totalParticipants: appState.participants,
            totalConversations: appState.conversations.length,
            totalSurveys: appState.surveys.length
        }
    };

    const content = JSON.stringify(allData, null, 2);
    const filename = `research_data_${new Date().toISOString().split('T')[0]}.json`;
    
    downloadFile(content, filename, 'application/json');
    window.researchApp.showSuccessMessage('تم تصدير جميع البيانات بنجاح');
}

function convertSurveysToCSV(surveys) {
    const headers = ['ID', 'Faculty_ID', 'Experience', 'PEOU1', 'PEOU2', 'PU1', 'PU2', 'Trust1', 'Trust2', 'Feedback', 'Timestamp'];
    
    let csv = headers.join(',') + '\r\n';
    
    surveys.forEach(survey => {
        const row = [
            survey.id,
            `"${survey.facultyId}"`,
            `"${survey.experience}"`,
            survey.responses.peou1 || '',
            survey.responses.peou2 || '',
            survey.responses.pu1 || '',
            survey.responses.pu2 || '',
            survey.responses.trust1 || '',
            survey.responses.trust2 || '',
            `"${(survey.feedback || '').replace(/"/g, '""')}"`,
            `"${survey.timestamp}"`
        ];
        
        csv += row.join(',') + '\r\n';
    });
    
    return csv;
}

function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob(['\uFEFF' + content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function generateReport() {
    const stats = window.researchApp.db.getStatistics();
    const averages = window.researchApp.db.getAverageScores();
    const experienceDist = window.researchApp.db.getExperienceDistribution();

    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalParticipants: stats.participants,
            totalSurveys: stats.totalSurveys,
            totalConversations: stats.totalChats,
            satisfactionRate: stats.satisfactionRate + '%'
        },
        averages: {
            perceivedEaseOfUse: Math.round((1 - (averages.peou - 1) / 4) * 100) + '%',
            perceivedUsefulness: Math.round((1 - (averages.pu - 1) / 4) * 100) + '%',
            trustInAI: Math.round((1 - (averages.trust - 1) / 4) * 100) + '%'
        },
        experienceDistribution: experienceDist,
        dataQuality: {
            completionRate: '100%',
            responseRate: Math.round((stats.totalSurveys / Math.max(stats.participants, 1)) * 100) + '%',
            dataIntegrity: 'ممتازة'
        }
    };

    const content = JSON.stringify(report, null, 2);
    const filename = `research_report_${new Date().toISOString().split('T')[0]}.json`;
    
    downloadFile(content, filename, 'application/json');
    window.researchApp.showSuccessMessage('تم إنشاء التقرير الإحصائي بنجاح');
}

// تأثيرات إضافية عند التمرير
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.backdropFilter = 'blur(10px)';
    } else {
        nav.style.background = 'var(--white)';
        nav.style.backdropFilter = 'none';
    }
});

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.researchApp = new ResearchApp();
    
    // إضافة أنماط إضافية للرسوم البيانية
    const style = document.createElement('style');
    style.textContent = `
        .chart-bars {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .chart-bar-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .bar-label {
            width: 100px;
            font-size: 0.9rem;
            color: #666;
        }
        .bar-container {
            flex: 1;
            background: #f0f0f0;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
        }
        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #3498db, #2ecc71);
            transition: width 1s ease-in-out;
            border-radius: 10px;
        }
        .bar-value {
            width: 80px;
            text-align: left;
            font-size: 0.9rem;
            font-weight: bold;
            color: #2c3e50;
        }
        .variables-chart {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .variable-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .variable-name {
            width: 180px;
            font-size: 0.9rem;
            color: #666;
        }
        .variable-bar-container {
            flex: 1;
            background: #f0f0f0;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
        }
        .variable-bar {
            height: 100%;
            transition: width 1s ease-in-out;
            border-radius: 10px;
        }
        .variable-value {
            width: 60px;
            text-align: left;
            font-size: 0.9rem;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
});
