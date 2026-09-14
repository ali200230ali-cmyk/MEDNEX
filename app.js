document.addEventListener("DOMContentLoaded", () => {

  // ==============================
  // عناصر الصفحة
  // ==============================

  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("medicineSearch");
  const results = document.getElementById("results");

  // ==============================
  // قواعد البيانات
  // ==============================

  let localMedicines = [];
  let products = [];
  let medicines = [];

  let currentLocalResults = [];
  let currentProductResults = [];
  let currentFDAResults = [];

  // ==============================
  // مرادفات الأدوية
  // ==============================

  const synonyms = {

    paracetamol: [
      "paracetamol",
      "acetaminophen",
      "panadol",
      "باراسيتامول",
      "بنادول",
      "أسيتامينوفين",
      "اسيتامينوفين"
    ],

    omeprazole: [
      "omeprazole",
      "أوميبرازول",
      "اوميبرازول"
    ],

    ibuprofen: [
      "ibuprofen",
      "إيبوبروفين",
      "ايبوبروفين"
    ],

    amoxicillin: [
      "amoxicillin",
      "أموكسيسيلين",
      "اموكسيسيلين"
    ],

    amlodipine: [
      "amlodipine",
      "أملوديبين",
      "املوديبين"
    ],

    lisinopril: [
      "lisinopril",
      "ليزينوبريل",
      "ليسينوبريل"
    ],

    losartan: [
      "losartan",
      "لوسارتان"
    ],

    atorvastatin: [
      "atorvastatin",
      "أتورفاستاتين",
      "اتورفاستاتين"
    ],

    furosemide: [
      "furosemide",
      "فوروسيميد"
    ]
  };

  // ==============================
  // تشغيل قواعد البيانات
  // ==============================

  loadDatabases();

  async function loadDatabases() {

    try {

      const [medicineResponse, productsResponse] =
        await Promise.all([
          fetch("data/cardiovascular.json"),
          fetch("data/products.json")
        ]);

      if (!medicineResponse.ok) {
        throw new Error(
          "تعذر تحميل قاعدة بيانات الأدوية"
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          "تعذر تحميل قاعدة بيانات المنتجات"
        );
      }

      localMedicines =
        await medicineResponse.json();

      products =
        await productsResponse.json();

      console.log(
        "MEDNEX medical database:",
        localMedicines.length
      );

      console.log(
        "MEDNEX products database:",
        products.length
      );

    } catch (error) {

      console.error(
        "MEDNEX database error:",
        error
      );

      localMedicines = [];
      products = [];
    }
  }

  // ==============================
  // البحث
  // ==============================

  if (searchButton) {

    searchButton.addEventListener(
      "click",
      searchMedicine
    );
  }

  if (searchInput) {

    searchInput.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {
          searchMedicine();
        }

      }
    );
  }

  async function searchMedicine() {

    const term =
      searchInput.value.trim();

    if (!term) {

      results.innerHTML = `
        <div class="info-box">
          <strong>اكتب اسم الدواء أو المنتج أولاً.</strong>
        </div>
      `;

      return;
    }

    results.innerHTML = `
      <div class="loading-box">
        🔎 جاري البحث في MEDNEX...
      </div>
    `;

    const normalizedTerm =
      normalizeText(term);

    // ==========================================
    // 1. البحث أولاً في قاعدة منتجات MEDNEX
    // ==========================================

    const productMatches =
      searchProducts(normalizedTerm);

    if (productMatches.length > 0) {

      currentProductResults =
        productMatches;

      displayProductResults(
        productMatches,
        term
      );

      return;
    }

    // ==========================================
    // 2. البحث في قاعدة الأدوية المحلية
    // ==========================================

    const localMatches =
      searchLocalMedicines(normalizedTerm);

    if (localMatches.length > 0) {

      currentLocalResults =
        localMatches;

      displayLocalResults(
        localMatches,
        term
      );

      return;
    }

    // ==========================================
    // 3. إذا لم نجد شيئاً → FDA
    // ==========================================

    await searchFDA(term);
  }

  // ==============================
  // تطبيع النص
  // ==============================

  function normalizeText(text) {

    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/\s+/g, " ");
  }

  // ==============================
  // الحصول على المرادفات
  // ==============================

  function getSearchTerms(term) {

    const normalized =
      normalizeText(term);

    let searchTerms = [normalized];

    for (const key in synonyms) {

      const group =
        synonyms[key].map(
          item => normalizeText(item)
        );

      if (group.includes(normalized)) {

        searchTerms =
          [...new Set([
            ...searchTerms,
            ...group
          ])];

        break;
      }
    }

    return searchTerms;
  }

  // ==============================
  // البحث في products.json
  // ==============================

  function searchProducts(term) {

    const searchTerms =
      getSearchTerms(term);

    return products.filter(product => {

      if (
        product.active === false
      ) {
        return false;
      }

      const fields = [

        product.name,
        product.arabicName,
        product.category,
        product.subCategory,
        product.strength,
        product.dosageForm,
        product.manufacturer,

        ...(Array.isArray(product.tradeNames)
          ? product.tradeNames
          : [])

      ];

      return fields.some(field => {

        const value =
          normalizeText(field);

        return searchTerms.some(
          searchTerm =>
            value.includes(searchTerm) ||
            searchTerm.includes(value)
        );

      });

    });
  }

  // ==============================
  // عرض نتائج المنتجات
  // ==============================

  function displayProductResults(
    productResults,
    searchTerm
  ) {

    let html = `

      <div class="source-box">

        <strong>MEDNEX</strong>

        <div>
          منتجات مطابقة لبحث:
          <strong>${escapeHTML(searchTerm)}</strong>
        </div>

        <small>
          النتائج من قاعدة منتجات MEDNEX
        </small>

      </div>

      <div class="results-count">
        تم العثور على ${productResults.length} منتج
      </div>

    `;

    productResults.forEach(
      (product, index) => {

        const prescriptionText =
          product.prescriptionRequired
            ? "يحتاج وصفة طبية"
            : "لا يحتاج وصفة طبية";

        html += `

          <div class="medicine-card">

            <h3>
              ${escapeHTML(
                product.arabicName ||
                product.name ||
                "منتج"
              )}
            </h3>

            <p>
              <strong>
                الاسم العلمي:
              </strong>
              ${escapeHTML(
                product.name || "-"
              )}
            </p>

            <p>
              <strong>
                التصنيف:
              </strong>
              ${escapeHTML(
                product.category || "-"
              )}
            </p>

            <p>
              <strong>
                القسم:
              </strong>
              ${escapeHTML(
                product.subCategory || "-"
              )}
            </p>

            <p>
              <strong>
                التركيز:
              </strong>
              ${escapeHTML(
                product.strength || "-"
              )}
            </p>

            <p>
              <strong>
                الشكل الدوائي:
              </strong>
              ${escapeHTML(
                product.dosageForm || "-"
              )}
            </p>

            <p>
              <strong>
                الوصفة:
              </strong>
              ${prescriptionText}
            </p>

            ${
              product.manufacturer
                ? `
                  <p>
                    <strong>
                      الشركة:
                    </strong>
                    ${escapeHTML(
                      product.manufacturer
                    )}
                  </p>
                `
                : ""
            }

            <button
              class="details-button"
              onclick="showProductDetails(${index})"
            >
              عرض المنتج
            </button>

          </div>

        `;
      }
    );

    results.innerHTML = html;
  }

  // ==============================
  // تفاصيل المنتج
  // ==============================

  window.showProductDetails =
    function(index) {

      const product =
        currentProductResults[index];

      if (!product) {
        return;
      }

      const prescriptionText =
        product.prescriptionRequired
          ? "يحتاج وصفة طبية"
          : "لا يحتاج وصفة طبية";

      results.innerHTML = `

        <button
          class="back-button"
          onclick="backToProductResults()"
        >
          ← العودة إلى النتائج
        </button>

        <div class="medicine-details">

          <h2>
            ${escapeHTML(
              product.arabicName ||
              product.name ||
              "المنتج"
            )}
          </h2>

          <div class="detail-section">

            <h3>بيانات المنتج</h3>

            <p>
              <strong>الاسم العلمي:</strong>
              ${escapeHTML(
                product.name || "-"
              )}
            </p>

            <p>
              <strong>الاسم العربي:</strong>
              ${escapeHTML(
                product.arabicName || "-"
              )}
            </p>

            <p>
              <strong>التصنيف:</strong>
              ${escapeHTML(
                product.category || "-"
              )}
            </p>

            <p>
              <strong>التصنيف الفرعي:</strong>
              ${escapeHTML(
                product.subCategory || "-"
              )}
            </p>

            <p>
              <strong>التركيز:</strong>
              ${escapeHTML(
                product.strength || "-"
              )}
            </p>

            <p>
              <strong>الشكل الدوائي:</strong>
              ${escapeHTML(
                product.dosageForm || "-"
              )}
            </p>

            <p>
              <strong>الوصفة الطبية:</strong>
              ${prescriptionText}
            </p>

            ${
              product.manufacturer
                ? `
                  <p>
                    <strong>الشركة المصنعة:</strong>
                    ${escapeHTML(
                      product.manufacturer
                    )}
                  </p>
                `
                : ""
            }

            ${
              Array.isArray(product.tradeNames) &&
              product.tradeNames.length > 0
                ? `
                  <p>
                    <strong>الأسماء التجارية:</strong>
                    ${product.tradeNames
                      .map(
                        name =>
                          escapeHTML(name)
                      )
                      .join("، ")}
                  </p>
                `
                : ""
            }

          </div>

          <div class="info-box">

            <strong>
              ملاحظة:
            </strong>

            <p>
              بيانات المنتج الحالية جزء من
              قاعدة MEDNEX التجريبية، ولا تعني
              توفر المنتج حاليًا في صيدلية معينة.
            </p>

          </div>

          <button
            class="details-button"
            onclick="searchMedicalInformation('${escapeJS(product.name || "")}')"
          >
            🩺 البحث عن المعلومات الدوائية
          </button>

        </div>

      `;
    };

  // ==============================
  // العودة إلى نتائج المنتجات
  // ==============================

  window.backToProductResults =
    function() {

      displayProductResults(
        currentProductResults,
        searchInput.value
      );
    };

  // ==============================
  // البحث عن المعلومات الطبية
  // ==============================

  window.searchMedicalInformation =
    function(term) {

      const normalized =
        normalizeText(term);

      const matches =
        localMedicines.filter(
          medicine => {

            const fields = [

              medicine.genericName,
              medicine.arabicName,
              medicine.class,
              medicine.therapeuticClass

            ];

            return fields.some(
              field =>
                normalizeText(field)
                  .includes(normalized)
            );
          }
        );

      if (matches.length > 0) {

        currentLocalResults =
          matches;

        displayLocalResults(
          matches,
          term
        );

        return;
      }

      results.innerHTML = `

        <button
          class="back-button"
          onclick="backToProductResults()"
        >
          ← العودة إلى المنتج
        </button>

        <div class="info-box">

          <h3>
            لم نجد معلومات دوائية محلية
          </h3>

          <p>
            سيتم البحث في FDA عن:
            <strong>
              ${escapeHTML(term)}
            </strong>
          </p>

        </div>

      `;

      searchFDA(term);
    };

  // ==============================
  // البحث في قاعدة القلب والأوعية
  // ==============================

  function searchLocalMedicines(term) {

    const searchTerms =
      getSearchTerms(term);

    return localMedicines.filter(
      medicine => {

        const fields = [

          medicine.genericName,
          medicine.arabicName,
          medicine.class,
          medicine.therapeuticClass

        ];

        return fields.some(field => {

          const value =
            normalizeText(field);

          return searchTerms.some(
            searchTerm =>
              value.includes(searchTerm)
          );

        });

      }
    );
  }

  // ==============================
  // عرض نتائج قاعدة الأدوية
  // ==============================

  function displayLocalResults(
    medicineResults,
    searchTerm
  ) {

    let html = `

      <div class="source-box">

        <strong>MEDNEX</strong>

        <div>
          نتائج قاعدة المعلومات الدوائية
        </div>

        <small>
          الجهاز: القلب والأوعية الدموية
        </small>

      </div>

      <div class="results-count">
        تم العثور على ${medicineResults.length} نتيجة
      </div>

    `;

    medicineResults.forEach(
      (medicine, index) => {

        html += `

          <div class="medicine-card">

            <h3>
              ${escapeHTML(
                medicine.arabicName ||
                medicine.genericName ||
                "-"
              )}
            </h3>

            <p>
              <strong>
                الاسم العلمي:
              </strong>
              ${escapeHTML(
                medicine.genericName || "-"
              )}
            </p>

            <p>
              <strong>
                الفئة الدوائية:
              </strong>
              ${escapeHTML(
                medicine.class || "-"
              )}
            </p>

            <p>
              <strong>
                الفئة العلاجية:
              </strong>
              ${escapeHTML(
                medicine.therapeuticClass || "-"
              )}
            </p>

            <p>
              <strong>
                الأشكال الدوائية:
              </strong>
              ${formatArray(
                medicine.dosageForms
              )}
            </p>

            <button
              class="details-button"
              onclick="showLocalMedicineDetails(${index})"
            >
              عرض التفاصيل
            </button>

          </div>

        `;
      }
    );

    results.innerHTML = html;
  }

  // ==============================
  // تفاصيل الدواء المحلي
  // ==============================

  window.showLocalMedicineDetails =
    function(index) {

      const medicine =
        currentLocalResults[index];

      if (!medicine) {
        return;
      }

      results.innerHTML = `

        <button
          class="back-button"
          onclick="backToResults()"
        >
          ← العودة إلى النتائج
        </button>

        <div class="medicine-details">

          <h2>
            ${escapeHTML(
              medicine.arabicName ||
              medicine.genericName ||
              "-"
            )}
          </h2>

          <div class="detail-section">

            <h3>المعلومات الأساسية</h3>

            <p>
              <strong>الاسم العلمي:</strong>
              ${escapeHTML(
                medicine.genericName || "-"
              )}
            </p>

            <p>
              <strong>الاسم العربي:</strong>
              ${escapeHTML(
                medicine.arabicName || "-"
              )}
            </p>

            <p>
              <strong>الفئة الدوائية:</strong>
              ${escapeHTML(
                medicine.class || "-"
              )}
            </p>

            <p>
              <strong>الفئة العلاجية:</strong>
              ${escapeHTML(
                medicine.therapeuticClass || "-"
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>دواعي الاستعمال</h3>

            <p>
              ${formatValue(
                medicine.indications
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>آلية العمل</h3>

            <p>
              ${formatValue(
                medicine.mechanism
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>التركيزات</h3>

            <p>
              ${formatArray(
                medicine.strengths
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>الأشكال الدوائية</h3>

            <p>
              ${formatArray(
                medicine.dosageForms
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>موانع الاستعمال</h3>

            <p>
              ${formatValue(
                medicine.contraindications
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>التحذيرات</h3>

            <p>
              ${formatValue(
                medicine.warnings
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>الآثار الجانبية</h3>

            <p>
              ${formatValue(
                medicine.adverseEffects
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>الجرعات</h3>

            <p>
              ${formatValue(
                medicine.dosage
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>تعديل الجرعة في القصور الكلوي</h3>

            <p>
              ${formatValue(
                medicine.renalAdjustment
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>تعديل الجرعة في القصور الكبدي</h3>

            <p>
              ${formatValue(
                medicine.hepaticAdjustment
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>التداخلات الدوائية</h3>

            <p>
              ${formatValue(
                medicine.interactions
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>الحمل</h3>

            <p>
              ${formatValue(
                medicine.pregnancy
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>المتابعة والمراقبة</h3>

            <p>
              ${formatValue(
                medicine.monitoring
              )}
            </p>

          </div>

          <div class="detail-section">

            <h3>المصادر</h3>

            <p>
              ${formatValue(
                medicine.sources
              )}
            </p>

          </div>

          <div id="pubmedResearch"></div>

        </div>

      `;

      loadPubMedResearch(
        medicine.genericName
      );
    };

  // ==============================
  // العودة إلى نتائج قاعدة الأدوية
  // ==============================

  window.backToResults =
    function() {

      displayLocalResults(
        currentLocalResults,
        searchInput.value
      );
    };

  // ==============================
  // FDA
  // ==============================

  async function searchFDA(term) {

    try {

      const url =
        "https://api.fda.gov/drug/label.json" +
        "?search=" +
        encodeURIComponent(
          `(openfda.generic_name:${term}` +
          ` OR openfda.brand_name:${term})`
        ) +
        "&limit=10";

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          "FDA search failed"
        );
      }

      const data =
        await response.json();

      if (
        !data.results ||
        data.results.length === 0
      ) {

        results.innerHTML = `

          <div class="info-box">

            <h3>
              لم يتم العثور على نتائج
            </h3>

            <p>
              لم نجد معلومات مطابقة لـ:
              <strong>
                ${escapeHTML(term)}
              </strong>
            </p>

            <small>
              جرّب الاسم العلمي أو الاسم التجاري
              باللغة الإنجليزية.
            </small>

          </div>

        `;

        return;
      }

      currentFDAResults =
        data.results;

      displayFDAResults(
        data.results,
        term
      );

    } catch (error) {

      console.error(
        "FDA error:",
        error
      );

      results.innerHTML = `

        <div class="info-box">

          <h3>
            تعذر إتمام البحث
          </h3>

          <p>
            حدث خطأ أثناء الاتصال بمصدر FDA.
          </p>

          <p>
            حاول مرة أخرى لاحقًا.
          </p>

        </div>

      `;
    }
  }

  // ==============================
  // عرض نتائج FDA
  // ==============================

  function displayFDAResults(
    fdaResults,
    searchTerm
  ) {

    let html = `

      <div class="source-box">

        <strong>
          FDA / openFDA
        </strong>

        <div>
          نتائج البحث عن:
          <strong>
            ${escapeHTML(searchTerm)}
          </strong>
        </div>

      </div>

    `;

    fdaResults.forEach(
      (medicine, index) => {

        const openfda =
          medicine.openfda || {};

        const brand =
          firstValue(
            openfda.brand_name
          );

        const generic =
          firstValue(
            openfda.generic_name
          );

        const manufacturer =
          firstValue(
            openfda.manufacturer_name
          );

        html += `

          <div class="medicine-card">

            <h3>
              ${escapeHTML(
                brand ||
                generic ||
                "دواء"
              )}
            </h3>

            <p>
              <strong>
                الاسم العلمي:
              </strong>
              ${escapeHTML(
                generic || "-"
              )}
            </p>

            <p>
              <strong>
                الشركة:
              </strong>
              ${escapeHTML(
                manufacturer || "-"
              )}
            </p>

            <button
              class="details-button"
              onclick="showMedicineDetails(${index})"
            >
              عرض التفاصيل
            </button>

          </div>

        `;
      }
    );

    results.innerHTML = html;
  }

  // ==============================
  // تفاصيل FDA
  // ==============================

  window.showMedicineDetails =
    function(index) {

      const medicine =
        currentFDAResults[index];

      if (!medicine) {
        return;
      }

      const openfda =
        medicine.openfda || {};

      const brand =
        firstValue(
          openfda.brand_name
        );

      const generic =
        firstValue(
          openfda.generic_name
        );

      const manufacturer =
        firstValue(
          openfda.manufacturer_name
        );

      results.innerHTML = `

        <button
          class="back-button"
          onclick="backToFDAResults()"
        >
          ← العودة إلى النتائج
        </button>

        <div class="medicine-details">

          <h2>
            ${escapeHTML(
              brand ||
              generic ||
              "دواء"
            )}
          </h2>

          <div class="detail-section">

            <h3>المعلومات الأساسية</h3>

            <p>
              <strong>
                الاسم التجاري:
              </strong>
              ${escapeHTML(
                brand || "-"
              )}
            </p>

            <p>
              <strong>
                الاسم العلمي:
              </strong>
              ${escapeHTML(
                generic || "-"
              )}
            </p>

            <p>
              <strong>
                الشركة المصنعة:
              </strong>
              ${escapeHTML(
                manufacturer || "-"
              )}
            </p>

          </div>

          ${createFDASection(
            "الغرض والاستعمال",
            medicine.purpose
          )}

          ${createFDASection(
            "التحذيرات",
            medicine.warnings
          )}

          ${createFDASection(
            "موانع الاستعمال",
            medicine.contraindications
          )}

          ${createFDASection(
            "الآثار الجانبية",
            medicine.adverse_reactions
          )}

          ${createFDASection(
            "الجرعات وطريقة الاستعمال",
            medicine.dosage_and_administration
          )}

          ${createFDASection(
            "التداخلات الدوائية",
            medicine.drug_interactions
          )}

          <div id="pubmedResearch"></div>

        </div>

      `;

      loadPubMedResearch(
        generic || brand
      );
    };

  // ==============================
  // العودة من FDA
  // ==============================

  window.backToFDAResults =
    function() {

      displayFDAResults(
        currentFDAResults,
        searchInput.value
      );
    };

  // ==============================
  // PubMed
  // ==============================

  async function loadPubMedResearch(term) {

    const container =
      document.getElementById(
        "pubmedResearch"
      );

    if (!container || !term) {
      return;
    }

    container.innerHTML = `

      <div class="research-box">

        <h3>
          🔬 أحدث الأبحاث من PubMed
        </h3>

        <p>
          جاري البحث في الأدبيات العلمية...
        </p>

      </div>

    `;

    try {

      const searchUrl =
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi" +
        "?db=pubmed" +
        "&term=" +
        encodeURIComponent(term) +
        "&retmode=json" +
        "&retmax=20" +
        "&sort=date";

      const searchResponse =
        await fetch(searchUrl);

      if (!searchResponse.ok) {
        throw new Error(
          "PubMed search failed"
        );
      }

      const searchData =
        await searchResponse.json();

      const ids =
        searchData.esearchresult?.idlist || [];

      if (ids.length === 0) {

        container.innerHTML = `

          <div class="research-box">

            <h3>
              🔬 PubMed
            </h3>

            <p>
              لم يتم العثور على دراسات
              مطابقة حاليًا.
            </p>

          </div>

        `;

        return;
      }

      const fetchUrl =
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi" +
        "?db=pubmed" +
        "&id=" +
        ids.join(",") +
        "&retmode=xml";

      const fetchResponse =
        await fetch(fetchUrl);

      if (!fetchResponse.ok) {
        throw new Error(
          "PubMed fetch failed"
        );
      }

      const xmlText =
        await fetchResponse.text();

      const parser =
        new DOMParser();

      const xml =
        parser.parseFromString(
          xmlText,
          "text/xml"
        );

      const articles =
        Array.from(
          xml.querySelectorAll(
            "PubmedArticle"
          )
        );

      const research = [];

      articles.forEach(article => {

        const title =
          article.querySelector(
            "ArticleTitle"
          )?.textContent || "";

        const abstractNodes =
          Array.from(
            article.querySelectorAll(
              "AbstractText"
            )
          );

        const abstract =
          abstractNodes
            .map(node =>
              node.textContent
            )
            .join(" ");

        const journal =
          article.querySelector(
            "Journal Title"
          )?.textContent || "";

        const year =
          getPublicationYear(
            article
          );

        const pmid =
          article.querySelector(
            "PMID"
          )?.textContent || "";

        const publicationTypes =
          Array.from(
            article.querySelectorAll(
              "PublicationType"
            )
          ).map(
            node =>
              node.textContent
          );

        const studyType =
          detectStudyType(
            publicationTypes,
            title,
            abstract
          );

        research.push({

          title,
          abstract,
          journal,
          year,
          pmid,
          studyType

        });
      });

      research.sort(
        (a, b) =>
          Number(b.year || 0) -
          Number(a.year || 0)
      );

      displayPubMedResearch(
        research.slice(0, 8),
        term
      );

    } catch (error) {

      console.error(
        "PubMed error:",
        error
      );

      container.innerHTML = `

        <div class="research-box">

          <h3>
            🔬 PubMed
          </h3>

          <p>
            تعذر تحميل الأبحاث حاليًا.
          </p>

        </div>

      `;
    }
  }

  // ==============================
  // تحديد نوع الدراسة
  // ==============================

  function detectStudyType(
    publicationTypes,
    title,
    abstract
  ) {

    const text =
      (
        publicationTypes.join(" ") +
        " " +
        title +
        " " +
        abstract
      ).toLowerCase();

    if (
      text.includes(
        "systematic review"
      )
    ) {
      return "Systematic Review";
    }

    if (
      text.includes(
        "meta-analysis"
      ) ||
      text.includes(
        "meta analysis"
      )
    ) {
      return "Meta-analysis";
    }

    if (
      text.includes(
        "randomized controlled trial"
      ) ||
      text.includes(
        "randomised controlled trial"
      ) ||
      text.includes("clinical trial")
    ) {
      return "Clinical Trial / RCT";
    }

    if (
      text.includes(
        "observational"
      ) ||
      text.includes(
        "cohort"
      ) ||
      text.includes(
        "case-control"
      )
    ) {
      return "Observational Study";
    }

    if (
      text.includes("review")
    ) {
      return "Review";
    }

    return "Research Article";
  }

  // ==============================
  // عرض أبحاث PubMed
  // ==============================

  function displayPubMedResearch(
    research,
    term
  ) {

    const container =
      document.getElementById(
        "pubmedResearch"
      );

    if (!container) {
      return;
    }

    if (research.length === 0) {

      container.innerHTML = `

        <div class="research-box">

          <h3>
            🔬 أحدث الأبحاث
          </h3>

          <p>
            لم يتم العثور على دراسات مناسبة.
          </p>

        </div>

      `;

      return;
    }

    let html = `

      <div class="research-box">

        <h3>
          🔬 أحدث الأبحاث من PubMed
        </h3>

        <p>
          نتائج بحث مرتبطة بـ:
          <strong>
            ${escapeHTML(term)}
          </strong>
        </p>

        <small>
          المصدر: PubMed / NCBI
        </small>

      </div>

    `;

    research.forEach(article => {

      const abstract =
        article.abstract
          ? article.abstract.length > 500
            ? article.abstract.substring(
                0,
                500
              ) + "..."
            : article.abstract
          : "الملخص غير متوفر.";

      html += `

        <div class="research-card">

          <h4>
            ${escapeHTML(
              article.title ||
              "بدون عنوان"
            )}
          </h4>

          <p>
            <strong>
              نوع الدراسة:
            </strong>
            ${escapeHTML(
              article.studyType
            )}
          </p>

          <p>
            <strong>
              المجلة:
            </strong>
            ${escapeHTML(
              article.journal ||
              "-"
            )}
          </p>

          <p>
            <strong>
              السنة:
            </strong>
            ${escapeHTML(
              article.year ||
              "-"
            )}
          </p>

          <p>
            ${escapeHTML(
              abstract
            )}
          </p>

          ${
            article.pmid
              ? `
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(article.pmid)}/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pubmed-link"
                >
                  فتح الدراسة على PubMed
                </a>
              `
              : ""
          }

        </div>

      `;
    });

    container.innerHTML =
      html;
  }

  // ==============================
  // استخراج سنة النشر
  // ==============================

  function getPublicationYear(article) {

    const yearNode =
      article.querySelector(
        "PubDate Year"
      );

    if (yearNode) {
      return yearNode.textContent;
    }

    const medlineDate =
      article.querySelector(
        "PubDate MedlineDate"
      )?.textContent || "";

    const match =
      medlineDate.match(
        /\b(19|20)\d{2}\b/
      );

    return match
      ? match[0]
      : "";
  }

  // ==============================
  // إنشاء قسم FDA
  // ==============================

  function createFDASection(
    title,
    value
  ) {

    if (!value) {
      return "";
    }

    return `

      <div class="detail-section">

        <h3>
          ${escapeHTML(title)}
        </h3>

        <p>
          ${formatValue(value)}
        </p>

      </div>

    `;
  }

  // ==============================
  // تنسيق البيانات
  // ==============================

  function formatValue(value) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "غير متوفر";
    }

    if (Array.isArray(value)) {

      if (value.length === 0) {
        return "غير متوفر";
      }

      return value
        .map(item =>
          escapeHTML(item)
        )
        .join("<br>");
    }

    return escapeHTML(
      String(value)
    ).replace(
      /\n/g,
      "<br>"
    );
  }

  function formatArray(value) {

    if (
      !Array.isArray(value) ||
      value.length === 0
    ) {
      return "غير متوفر";
    }

    return value
      .map(item =>
        escapeHTML(item)
      )
      .join("، ");
  }

  function firstValue(value) {

    if (Array.isArray(value)) {
      return value[0] || "";
    }

    return value || "";
  }

  // ==============================
  // حماية HTML
  // ==============================

  function escapeHTML(value) {

    if (
      value === undefined ||
      value === null
    ) {
      return "";
    }

    return String(value)
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  // ==============================
  // حماية JavaScript داخل onclick
  // ==============================

  function escapeJS(value) {

    return String(value || "")
      .replace(
        /\\/g,
        "\\\\"
      )
      .replace(
        /'/g,
        "\\'"
      )
      .replace(
        /"/g,
        '\\"'
      )
      .replace(
        /\n/g,
        "\\n"
      )
      .replace(
        /\r/g,
        "\\r"
      );
  }

});
