export const he = {
  // General
  loading: 'טוען...',
  save: 'שמור',
  cancel: 'ביטול',
  delete: 'מחק',
  edit: 'ערוך',
  back: 'חזור',
  create: 'צור',
  confirm: 'אישור',
  yes: 'כן',
  no: 'לא',
  actions: 'פעולות',
  status: 'סטטוס',
  name: 'שם',
  description: 'תיאור',
  email: 'אימייל',
  role: 'תפקיד',
  team: 'צוות',
  date: 'תאריך',
  noData: 'אין נתונים',

  // Auth
  auth: {
    signIn: 'כניסה',
    signInSubtitle: 'היכנס לחשבונך',
    email: 'אימייל',
    password: 'סיסמה',
    signingIn: 'מתחבר...',
    invalidCredentials: 'אימייל או סיסמה שגויים',
    logout: 'יציאה',
  },

  // Nav
  nav: {
    dashboard: 'לוח בקרה',
    processes: 'תהליכים',
    executions: 'הרצות',
    team: 'צוות',
    admin: 'ניהול',
    users: 'משתמשים',
    teams: 'צוותים',
  },

  // Dashboard
  dashboard: {
    title: 'לוח בקרה',
    totalProcesses: 'סה"כ תהליכים',
    totalExecutions: 'סה"כ הרצות',
    platform: 'פלטפורמה',
  },

  // Processes
  processes: {
    title: 'תהליכים',
    newProcess: '+ תהליך חדש',
    processName: 'שם התהליך',
    steps: 'שלבים',
    executions: 'הרצות',
    publish: 'פרסם',
    run: 'הרץ',
    noProcesses: 'אין תהליכים. צור את הראשון!',
    deleteConfirm: 'למחוק תהליך זה?',
    status: {
      DRAFT: 'טיוטה',
      ACTIVE: 'פעיל',
      ARCHIVED: 'בארכיון',
      COMPLETED: 'הושלם',
    },
  },

  // Builder
  builder: {
    title: 'בונה תהליך',
    addStep: 'הוסף שלב',
    saveLayout: 'שמור פריסה',
    saving: 'שומר...',
    steps: 'שלבים',
    deleteStep: 'מחק שלב',
    close: 'סגור',
    stepTypes: {
      FORM: 'טופס',
      APPROVAL: 'אישור',
      CONDITION: 'תנאי',
      TASK: 'משימה',
      NOTIFICATION: 'התראה',
      REVIEW: 'סקירה',
      SVG_MODEL: 'מודל SVG',
    },
  },

  // Executions
  executions: {
    title: 'הרצות',
    runProcess: 'הרץ תהליך...',
    noExecutions: 'אין הרצות. הרץ תהליך כדי להתחיל.',
    started: 'התחיל',
    steps: 'שלבים',
    cancelConfirm: 'לבטל הרצה זו?',
    cancel: 'בטל הרצה',
    status: {
      RUNNING: 'פועל',
      ACTIVE: 'פעיל',
      COMPLETED: 'הושלם',
      FAILED: 'נכשל',
      CANCELLED: 'בוטל',
      PAUSED: 'מושהה',
      PENDING: 'ממתין',
      SKIPPED: 'דולג',
    },
  },

  // Step interaction
  steps: {
    submit: 'שלח',
    submitting: 'שולח...',
    approve: 'אשר',
    reject: 'דחה',
    rejectionReason: 'סיבת דחייה',
    markComplete: 'סמן כהושלם',
    notes: 'הערות (אופציונלי)',
    awaitingInput: 'ממתין לקלט',
  },

  // Team
  teamDashboard: {
    title: 'לוח צוות',
    activeExecutions: 'הרצות פעילות',
    teamMembers: 'חברי צוות',
    noActiveWork: 'אין פריטי עבודה פעילים.',
    noMembers: 'אין חברים.',
    noTeam: 'אינך משויך לצוות.',
    waiting: 'ממתין',
    view: 'צפה',
  },

  // Admin - Users
  users: {
    title: 'משתמשים',
    nameCol: 'שם',
    emailCol: 'אימייל',
    roleCol: 'תפקיד',
    teamCol: 'צוות',
    joinedCol: 'הצטרף',
    noTeam: '—',
  },

  // Admin - Teams
  teams: {
    title: 'צוותים',
    members: 'חברים',
    assignedSteps: 'שלבים מוקצים',
    inactive: 'לא פעיל',
  },

  // SVG Templates
  svgTemplates: {
    title: 'טמפלטי SVG',
    newTemplate: '+ טמפלט חדש',
    uploadSvg: 'העלה SVG',
    templateName: 'שם הטמפלט',
    noTemplates: 'אין טמפלטים. העלה את הראשון!',
    pointsConfig: 'הגדרת נקודות',
    addPoint: '+ נקודה',
    pointLabel: 'שם הנקודה',
    pointFieldType: 'סוג שדה',
    clickToPlace: 'לחץ על ה-SVG כדי להוסיף נקודה',
    saveTemplate: 'שמור טמפלט',
    editPoints: 'ערוך נקודות',
    deletePoint: 'מחק נקודה',
    selectTemplate: 'בחר טמפלט',
    configurePoints: 'הגדר נקודות',
    fillPoints: 'מלא נקודות',
    noPoints: 'אין נקודות מוגדרות',
    active: 'פעיל',
    inactive: 'לא פעיל',
    preview: 'תצוגה מקדימה',
  },

  // TopBar
  topBar: {
    logout: 'יציאה',
    toggleSidebar: 'תפריט',
  },
};

export type Translations = typeof he;
