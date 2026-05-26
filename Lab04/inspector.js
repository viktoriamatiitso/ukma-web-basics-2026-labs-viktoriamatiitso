// ============================================================
// Завдання 1 — DOM-аналізатор
// ============================================================
// 6 функцій. Не змінюйте HTML.
// Обмеження:
//   - жодного for циклу (map/filter/reduce/forEach)
//   - жодного innerHTML (читання тексту через textContent)
//   - кожна функція обробляє "нічого не знайдено" — повертає [] або null,
//     НЕ кидає помилку
// ============================================================

/**
 * Кількість слів у textContent елемента, заданого селектором.
 * Враховує trim, кілька пробілів, табуляції.
 * countWordsIn("#post-1") // ≈ 30
 * countWordsIn("#missing") // 0
 */
function countWordsIn(selector) {
    const element = document.querySelector(selector);
    if(!element){
        return 0;
    }
    const text = element.textContent.trim();
    if(!text){
        return 0;   
    }
    return text.split(' ').filter(word => word !== '').length;
}

/**
 * Усі посилання, з ознакою external (інший origin).
 * [{ text, href, isExternal }, ...]
 */
function allLinks() {
    const links = Array.from(document.querySelectorAll("a"));
    if(links.length === 0){
        return [];
    }

    return links.map(link => ({
        text: link.textContent.trim(),
        href: link.href,
        isExternal: new URL(link.href).origin !== window.location.origin
    }));
}

/**
 * <img> з проблемами:
 *   { src, reason: "no-alt" }      — атрибут alt відсутній
 *   { src, reason: "empty-alt" }   — alt="" але img інформативне
 *                                    (має width/height АБО всередині <figure>)
 */
function findOrphanImages() {
    const images = Array.from(document.querySelectorAll("img"));
    if(images.length === 0){
        return [];
    }

    return images.filter(img => {
        const hasAlt = img.hasAttribute("alt");
        const hasntAlt = img.getAttribute("alt") === ""
        const informative = img.hasAttribute("width") || img.hasAttribute("height") || img.closest("figure");
        return !hasAlt || (hasntAlt && informative);
    })
    .map(img => {
        let reason;
        if(!img.hasAttribute("alt")){
            reason = "no-alt";
        }else{
            reason = "empty-alt";
        }
        return{
            src: img.src,
            reason: reason
        };
    });
}

/**
 * Outline документа — усі h1-h6 у порядку появи.
 * [{ level: 1, text: "..." }, { level: 2, text: "..." }, ...]
 *
 * Якщо рівень стрибає (h2 → h4), додати warning:
 *   { level: 4, text: "...", warning: "h4 after h2" }
 */
function getHeadingsOutline() {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    if(headings.length === 0){
        return [];
    }

    let previousLevel = 0;

    return headings.map( heading => {
        const level = Number(heading.tagName[1]);
        const result = {
            level,
            text: heading.textContent.trim()
        };

        if(previousLevel && level > previousLevel + 1){
            result.warning = `h${level} after h${previousLevel}`;
        }
        previousLevel = level;
        return result;
    })
}

/**
 * Серед елементів, що матчать селектор, повертає найглибше вкладений
 * (з максимальною кількістю предків). При нічиї — перший.
 * Якщо нічого не знайдено — null.
 */
function findDeepest(selector) {
    const elements = Array.from(document.querySelectorAll(selector));
    if(elements.length ===0){
        return null;
    }

    const getDepth = element => {
        let depth = 0;
        let current = element.parentElement;
        while (current) {
            depth++;
            current = current.parentElement;
        }
        return depth;
    };

    return elements.reduce((deepest, current) => {
        if (getDepth(current) > getDepth(deepest)) {
            return current;
        }
        return deepest;
    });
}

/**
 * Топ-N найчастіших слів у елементі.
 * Ігнорувати: регістр, пунктуацію, слова коротші 3 символів.
 * [{ word: "семантика", count: 4 }, { word: "html", count: 2 }, ...]
 */
function wordFrequency(selector, n = 10) {
    const element = document.querySelector(selector);
    if(!element){
        return [];
    }

    const text = element.textContent.toLowerCase();
    const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ');
    const words =cleanText.split(" ");
    const filtredWords = words.filter(word => word.trim().length>= 3);

    const frequencies = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(frequencies)
        .map(([word, count]) => ({
            word,
            count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n);
}

// ============================================================
// Тестування
// ============================================================
console.log("Слів у post-1:", countWordsIn("#post-1"));
console.log("Посилання:", allLinks());
console.log("Проблемні img:", findOrphanImages());
console.log("Outline:", getHeadingsOutline());
console.log("Найглибше .highlight:", findDeepest(".highlight"));
console.log("Топ слів у post-1:", wordFrequency("#post-1", 5));