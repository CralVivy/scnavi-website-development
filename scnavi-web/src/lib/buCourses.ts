// src/lib/buCourses.ts
// Source: Bicol University official programs listing (full hierarchy)
// Structure: Campus → College → Courses[]

export interface BUCampus {
  name: string;
  colleges: BUCollege[];
}

export interface BUCollege {
  name: string;
  courses: string[];
}

export const BU_CAMPUSES: BUCampus[] = [
  // ── BU DARAGA ──────────────────────────────────────
  {
    name: "Bicol University Daraga",
    colleges: [
      {
        name: "CSSP — College of Social Sciences and Philosophy",
        courses: [
          "Bachelor of Arts in Peace Studies",
          "Bachelor of Arts in Philosophy",
          "Bachelor of Arts in Political Science",
          "Bachelor of Arts in Sociology",
          "Bachelor of Science in Psychology",
          "Bachelor of Science in Social Work",
        ],
      },
      {
        name: "CBEM — College of Business, Economics and Management",
        courses: [
          "Bachelor of Science in Accountancy",
          "Bachelor of Science in Economics",
          "Bachelor of Science in Entrepreneurship",
          "BSBA Major in Financial Management",
          "BSBA Major in Human Resource Management",
          "BSBA Major in Management",
          "BSBA Major in Marketing Management",
          "BSBA Major in Microfinance",
          "BSBA Major in Operations Management",
        ],
      },
      {
        name: "CE — College of Education",
        courses: [],
      },
    ],
  },

  // ── BU LEGAZPI WEST ────────────────────────────────
  {
    name: "Bicol University Legazpi — West",
    colleges: [
      {
        name: "CAL — College of Arts and Letters",
        courses: [
          "Bachelor of Arts in Broadcasting",
          "Bachelor of Arts in Communication",
          "Bachelor of Arts in English Language",
          "Bachelor of Arts in Journalism",
          "Bachelor of Performing Arts (BPeA) Theater",
          "Bachelor of Arts in Literature",
        ],
      },
      {
        name: "CN — College of Nursing",
        courses: [
          "Bachelor of Science in Nursing",
        ],
      },
      {
        name: "CS — College of Science",
        courses: [
          "Bachelor of Science in Biology",
          "Bachelor of Science in Chemistry",
          "Bachelor of Science in Computer Science",
          "Bachelor of Science in Information Technology",
          "Bachelor of Science in Meteorology",
        ],
      },
      {
        name: "IPESR — Institute of Physical Education, Sports, and Recreation",
        courses: [
          "Bachelor of Physical Education",
          "Bachelor of Science in Exercise & Sports Sciences major in Fitness and Sports Coaching",
          "Bachelor of Science in Exercise & Sports Sciences major in Fitness and Sports Management",
        ],
      },
      {
        name: "JMRIGD — Jesse M. Robredo Institute of Governance and Development",
        courses: [
          "Bachelor of Public Administration",
        ],
      },
      {
        name: "CDM — College of Dental Medicine",
        courses: [
          "Doctor of Dental Medicine",
        ],
      },
    ],
  },

  // ── BU LEGAZPI EAST ────────────────────────────────
  {
    name: "Bicol University Legazpi — East",
    colleges: [
      {
        name: "CENG — College of Engineering",
        courses: [
          "Bachelor of Science in Chemical Engineering",
          "Bachelor of Science in Civil Engineering",
          "Bachelor of Science in Electrical Engineering",
          "Bachelor of Science in Geodetic Engineering",
          "Bachelor of Science in Mechanical Engineering",
          "Bachelor of Science in Mining Engineering",
        ],
      },
      {
        name: "IDeA — Institute of Design and Architecture",
        courses: [
          "Bachelor of Science in Architecture",
        ],
      },
      {
        name: "CIT — College of Industrial Technology",
        courses: [
          "BIndTech Major in Automotive Technology",
          "BIndTech Major in Construction Technology",
          "BIndTech Major in Electrical Technology",
          "BIndTech Major in Electronics Technology",
          "BIndTech Major in Mechanical Technology",
          "Bachelor of Science in Food Technology",
          "B Industrial Design",
          "BTVTEd Major in Drafting Technology",
          "BTVTEd Major in Electrical Technology",
          "BTVTEd Major in Food and Service Management",
          "BTVTEd Major in Garments Fashion and Design",
        ],
      },
    ],
  },

  // ── BU GUINOBATAN ──────────────────────────────────
  {
    name: "Bicol University Guinobatan",
    colleges: [
      {
        name: "Undergraduate Programs",
        courses: [
          "Bachelor of Science in Agribusiness",
          "Bachelor of Science in Agricultural & Biosystems Engineering",
          "Bachelor of Science in Agriculture",
          "Bachelor of Science in Forestry",
          "Bachelor of Science in Development Communication",
          "Bachelor of Technical-Vocational Teacher Education Major in Animal Production",
          "Bachelor of Technical-Vocational Teacher Education Major in Agricultural Crop Production",
          "Bachelor of Science in Food Technology",
          "Doctor of Veterinary Medicine",
        ],
      },
    ],
  },

  // ── BU TABACO ──────────────────────────────────────
  {
    name: "Bicol University Tabaco",
    colleges: [
      {
        name: "Undergraduate Programs",
        courses: [
          "Bachelor of Secondary Education Major in Science",
          "Bachelor of Secondary Education Major in Math",
          "Bachelor of Science in Entrepreneurship",
          "Bachelor of Science in Fisheries",
          "Bachelor of Science in Food Technology",
          "Bachelor of Science in Nursing",
          "Bachelor of Science in Social Work",
        ],
      },
    ],
  },

  // ── BU GUBAT ───────────────────────────────────────
  {
    name: "Bicol University Gubat",
    colleges: [
      {
        name: "Undergraduate Programs",
        courses: [
          "Bachelor of Elementary Education",
          "Bachelor of Secondary Education Major in Filipino",
          "Bachelor of Secondary Education Major in Social Studies",
          "Bachelor of Science in Entrepreneurship - General Track",
          "Bachelor of Science in Entrepreneurship - Agribusiness Track",
          "BSBA Major in Microfinance",
        ],
      },
    ],
  },

  // ── BU POLANGUI ────────────────────────────────────
  {
    name: "Bicol University Polangui",
    colleges: [
      {
        name: "Undergraduate Programs",
        courses: [
          "Bachelor of Science in Computer Engineering",
          "Bachelor of Science in Electronics and Communications Engineering",
          "Bachelor of Science in Automotive Technology",
          "Bachelor of Science in Electrical Technology",
          "Bachelor of Science in Electronics Technology",
          "Bachelor of Science in Mechanical Technology",
          "Bachelor of Science in Computer Science",
          "Bachelor of Science in Information Technology",
          "Bachelor of Science in Information Systems",
          "Bachelor in Elementary Education",
          "Bachelor in Secondary Education",
          "Bachelor of Science in Entrepreneurship",
          "Bachelor of Science in Food Technology",
          "Bachelor of Science in Nursing",
        ],
      },
    ],
  },

  // ── POST BACCALAUREATE ─────────────────────────────
  {
    name: "Post Baccalaureate Programs",
    colleges: [
      {
        name: "College of Medicine",
        courses: [
          "Doctor of Medicine",
        ],
      },
      {
        name: "College of Law",
        courses: [],
      },
    ],
  },

  // ── GRADUATE SCHOOL ────────────────────────────────
  {
    name: "Graduate School Programs",
    colleges: [
      {
        name: "Doctoral Degree Programs",
        courses: [
          "Doctor of Education in Educational Leadership and Management",
          "Doctor of Education in Educational Leadership and Management (Open University)",
          "Doctor of Philosophy in Educational Foundations",
          "Doctor of Philosophy in Mathematics Education",
          "Doctor of Philosophy in Filipino",
          "Doctor of Philosophy in Public Administration",
          "Doctor of Philosophy in Development Management",
          "Doctor of Philosophy in Peace and Security Administration",
        ],
      },
      {
        name: "Master's Degree Programs",
        courses: [
          "Master of Arts in Educational Leadership and Management",
          "Master of Arts in Educational Leadership and Management (Open University)",
          "Master in Educational Leadership and Management (Non-Thesis)",
          "Master of Arts in Biology Education",
          "Master in Biology Education (Non-Thesis)",
          "Master of Arts in Chemistry Education",
          "Master in Chemistry Education (Non-Thesis)",
          "Master of Arts in Cultural Education",
          "Master of Arts in English Education",
          "Master of Arts in English Education (Open University)",
          "Master in English Education (Non-Thesis)",
          "Master of Arts in Filipino (Master ng Sining sa Pagtuturo ng Filipino)",
          "Master in Filipino Education (Master ng Pagtuturo ng Filipino) (Non-Thesis)",
          "Master of Arts in General Science Education",
          "Master in General Science Education (Non-Thesis)",
          "Master of Arts in Guidance and Counseling",
          "Master of Arts in History Education",
          "Master in History Education (Non-Thesis)",
          "Master of Arts in Mathematics Education",
          "Master in Mathematics Education (Non-Thesis)",
          "Master of Arts in Music Education",
          "Master in Music Education (Non-Thesis)",
          "Master of Arts in Physics Education",
          "Master in Physics Education",
          "Master of Arts in Pre-School Education",
          "Master in Pre-School Education",
          "Master of Arts in Reading Education",
          "Master in Reading Education (Non-Thesis)",
          "Master of Arts in Social Studies Education",
          "Master of Arts in Social Studies Education (Open University)",
          "Master in Social Studies Education (Non-Thesis)",
          "Master of Arts in Industrial Education Major in Teaching TLE",
          "Master in Industrial Education Major in Teaching TLE (Non-Thesis)",
          "Master of Arts in Chemistry",
          "Master in Cooperative Management",
          "Master in Cooperative Management (Non-Thesis)",
          "Master in Economics",
          "Master in Economics (Non-Thesis)",
          "Master in Entrepreneurship",
          "Master in Entrepreneurship (Non-Thesis)",
          "Master in Local Government Management",
          "Master in Local Government Management (Open University)",
          "Master in Local Government Management (Non-Thesis)",
          "Master in Management",
          "Master in Management (Open University)",
          "Master in Management (Non-Thesis)",
          "Master in Management Major in Human Resource Management",
          "Master in Management Major in Human Resource Management (Non-Thesis)",
          "Master of Public Administration",
          "Master of Public Administration (Open University)",
          "Master in Public Administration Major in Health Emergency and Disaster Management",
          "Master of Science in Agriculture Major in Agricultural Education",
          "Master of Science in Agriculture Major in Agronomy",
          "Master of Science in Agriculture Major in Crop Science",
          "Master of Science in Agriculture Major in Animal Science",
          "Master of Science in Architecture",
          "Master of Arts in Nursing",
          "Master of Science in Fisheries Major in Aquaculture",
          "Master of Science in Fisheries Major in Coastal Resource Management",
          "Master of Science in Fisheries Technology",
          "Master of Arts in Physical Education",
          "Master of Arts in Physical Education (Non-Thesis)",
          "Master of Arts in Literature",
          "Master in Filipino",
          "Master of Arts in Peace and Security Studies",
          "Master in Information System",
          "Master of Science in Biology",
          "Master in Rural Development",
          "Master in Public Administration Major in Public Procurement",
          "Master of Science in Biodiversity and Environmental Management",
          "Master in Entrepreneurship Major in Environmental Entrepreneurship",
          "Master of Science in Sustainable Food System",
        ],
      },
      {
        name: "Diploma Programs",
        courses: [
          "Diploma in Biology Education",
          "Diploma in Chemistry Education",
          "Diploma in Cultural Education",
          "Diploma in English Education",
          "Diploma in Teaching Filipino (Diploma sa Pagtuturo ng Filipino)",
          "Diploma in General Science Education",
          "Diploma in Guidance and Counseling",
          "Diploma in Teaching History",
          "Diploma in Mathematics Education",
          "Diploma in Music Education",
          "Diploma in Physics Education",
          "Diploma in Pre-School Education",
          "Diploma in Reading Education",
          "Diploma in Teaching Social Studies",
          "Diploma in Teaching Technology & Livelihood Education",
          "Diploma in Cooperative Management",
          "Diploma in Entrepreneurship",
          "Diploma in Local Government Management",
          "Diploma in Human Resource Management",
          "Diploma in Agriculture Major in Crop Production",
          "Diploma in Agriculture Major in Animal Production",
          "Diploma in Architecture",
          "Diploma in Earth Science Education",
          "Diploma in Teaching English as a Second Language",
          "Diploma in Energy Technology",
          "Diploma in Public Procurement",
        ],
      },
    ],
  },
];

/** Flat list of all course names (for backward compat / search) */
export const BU_COURSES: string[] = [
  "Not Specified",
  ...BU_CAMPUSES.flatMap((campus) =>
    campus.colleges.flatMap((college) => college.courses)
  ).filter(Boolean),
];

/**
 * Legacy compat: flat Record<group, courses[]> used by older components.
 * Prefer BU_CAMPUSES for new code.
 */
export const BU_COURSE_GROUPS: Record<string, string[]> = {};
BU_CAMPUSES.forEach((campus) => {
  campus.colleges.forEach((college) => {
    if (college.courses.length > 0) {
      const key = `${campus.name} — ${college.name}`;
      BU_COURSE_GROUPS[key] = college.courses;
    }
  });
});
