// ==UserScript==
// @name         Steamcommunity-CleanUp
// @namespace    https://github.com/veehawt/Steamcommunity-CleanUp
// @version      0.2.0
// @description  UserScript that improves the Steam forums by hiding discussion topics.
// @author       vee (https://github.com/veehawt | https://steamcommunity.com/profiles/76561197969754818)
// @supportURL   https://github.com/veehawt/Steamcommunity-CleanUp/issues
// @downloadURL  https://github.com/veehawt/Steamcommunity-CleanUp/raw/master/sccu.user.js
// @updateURL    https://github.com/veehawt/Steamcommunity-CleanUp/raw/master/sccu.user.js
// @match        https://steamcommunity.com/*/*/discussions/*
// @match        https://steamcommunity.com/app/*/tradingforum/*
// @match        https://steamcommunity.com/app/*/eventcomments/*
// @match        https://steamcommunity.com/discussions/forum/*
// @match        https://steamcommunity.com/profiles/*
// @match        https://steamcommunity.com/id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Blocked user topics to hide
    const blocked = [
        "topic by a blocked user", "来自被屏蔽用户的主题", "來自被封鎖使用者的主題",
        "ブロック中のユーザーによるトピック", "กระทู้จากผู้ใช้ที่ถูกบล็อค", "Тема от блокиран потребител",
        "Téma od blokovaného uživatele", "Emne fra en blokeret bruger", "Thema eines blockierten Nutzers",
        "Tema de un usuario bloqueado", "Θέμα από αποκλεισμένο χρήστη", "Sujet d'une personne bloquée",
        "Discussione di un utente bloccato", "Topik dari pengguna yang diblokir", "Blokkolt felhasználó témája",
        "Onderwerp van een geblokkeerde gebruiker", "Emne av en blokkert bruker", "Wątek autorstwa zablokowanego użytkownika",
        "Tópico de um utilizador bloqueado", "Tópico de um usuário bloqueado", "Subiectul unui utilizator blocat",
        "Тема, созданная заблокированным пользователем", "Estetyn käyttäjän keskustelunaihe", "Ämne från en blockerad användare",
        "Engellenmiş kullanıcıya ait başlık", "Chủ đề từ người dùng bị chặn", "Тема від заблокованого користувача"
    ];

    // Keywords in topic titles to hide
    const keywords = [
        //"hack", // Add your keywords here
        //"cheat",
        //"devs",
        //"noob",
    ];

    // Regex trade patterns in topic titles to hide (disabled on trade forums)
    const patternTrade = [
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*i\s*v\s*e\s*a\s*w\s*a\s*y\b))[^\w\s]*\b/i, // most common iterations of "free giveaway"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bp\s*o+\s*i\s*n\s*t\s*s\b))[^\w\s]*\b/i, // "free points"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bs\s*k(?:i|\|)n\s*s\b))[^\w\s]*\b/i, // "free skins"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bi(?:t|\+)e\s*m(?:s|\$)\b))[^\w\s]*\b/i, // "free items"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bk\s*n\s*i\s*[vf]\s*e\s*s\b))[^\w\s]*\b/i, // "free knife"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*l\s*o\s*v\s*e\s*s\b))[^\w\s]*\b/i, // "free gloves"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*i\s*v\s*e\s*a\s*w\s*a\s*y\b))[^\w\s]*\b/i, // "free giveaway"
        /\b[^\w\s]*(?:w\s*t\s*b|w\s*t\s*s|w\s*t\s*t)[^\w\s]*\b/i, // most common iterations of  "wtb, wts, wtt"
        /\bo+f{2,}e+r{1,}i?n?g?s?\b/i, // "offer, offering, offers"
        /(?<![\w-])([HWhw]|\([HWhw]\)|\[[HWhw]\]|\{[HWhw]\}|<[HWhw]>|<[\(\[\{]?[HWhw][\)\]\}]?>)(?![\w-])/, // H W with various brackets
        /\bopen (?:inventory|inv|trade)\b/i, // "open inventory"
    ];

    // Regex language patterns in topic titles to hide (disabled on trade forums)
    const patternLang = [
        //[A-Za-z]+/, // English and the basic Latin alphabet
        /[\u0400-\u04FF]/, // Cyrillic (Ukrainian, Russian, Bulgarian, Serbian and more)
        /[\u0600-\u06FF]/, // Arabic
        /[\u0590-\u05FF]/, // Hebrew
        /[\u4E00-\u9FFF]/, // Chinese
        /[\u0900-\u097F]/, // Devanagari (Hindi, Marathi, Sanskrit, etc.)
        /[\u0E00-\u0E7F]/, // Thai
        /[\uAC00-\uD7AF\u1100-\u11FF]/, // Korean
        /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/, // Japanese
        /[àảạằắẳẵặèẻẽẹềếểễệìỉĩịòỏõọồốổỗộờớởỡợùủũụưừứửữựỳỷỹỵđ]/i, // Vietnamese
        /[\u0370-\u03FF]/, // Greek
        /[ğşşçıİĞŞÇ]/, // some Turkish characters aiming to hide Turkish topics
        //[ÄäÖöÜü]/, // additional Turkish letters but also German, Estonian, Finnish and Hungarian
        /[ŐőŰű]/, // Hungarian
        /[Łł]/, // Polish
        //[ÆæØøÅåÞþÐð]/, // Nordic (Danish, Finnish, Icelandic, Norwegian and Swedish)

    ];

    const patternSpam = [
        /[\+\-]?\s*rep\s*(for\s*[\+\-]?\s*rep|\bme\b)?\b/i, // +rep for rep
        /\bcomment\s+for\s+comment\b/, // comment for comment
    ];

    const scriptStyles = `
        .add-nickname img.nickname-icon {
            vertical-align: middle;
            margin-left: 4px;
            margin-right: -4px;
            position: relative;
            top: 1px;
        }
        .custom-button {
            display: relative;
            border-radius: 2px;
            border: none;
            width: 112px;
            height: 17px;
            padding: 0px 16px;
            background: rgba(103, 193, 245, 0.2);
            cursor: pointer;
            text-decoration: none !important;
            color: #67c1f5 !important;
            line-height: 17px;
        }
        .custom-button.active {
            box-shadow: 0 0 2px #417a9b, 0 0 10px #417a9b;
            background: #549EC8
            background: -webkit-linear-gradient( 150deg, #417a9b 5%, #549EC8 95%);
            background: linear-gradient( -60deg, #417a9b 5%, #549EC8 95%);
            color: #fff !important;
        }
        .custom-button:hover {
            background: #417a9b;
            background: -webkit-linear-gradient( 150deg, #417a9b 5%,#67c1f5 95%);
            background: linear-gradient( -60deg, #417a9b 5%, #67c1f5 95%);
            color: #fff !important;
        }
        .hidden-pattern-keyword {
            background-color: rgba(118, 85, 116, 0.5);
        }
        .hidden-pattern-keyword:hover {
            background-color: rgba(141, 102, 139, 0.8);
        }
        .hidden-blocked-user {
            border-left: 2px solid #f84972;
            border-right: 2px solid #f84972;
            background-color: rgba(118, 85, 116, 0.5);
        }
        .hidden-blocked-user:hover {
            background-color: rgba(141, 102, 139, 0.8);
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = scriptStyles;
    document.head.appendChild(styleSheet);

    const TradingForum = window.location.href.includes('/tradingforum/');



    function watchUrl() {
        window.addEventListener('popstate', () => {
            initCounts();
            setVisibleCount();
        });

        window.addEventListener('hashchange', () => {
            initCounts();
            setVisibleCount();
        });
    }


    function matchesCriteria(title, keywordList, patternList) {
        for (let keyword of keywordList) {
            if (title.toLowerCase().includes(keyword.toLowerCase())) {
                return true;
            }
        }

        for (let pattern of patternList) {
            if (pattern.test(title)) {
                return true;
            }
        }

        return false;
    }

    function countHiddenTopics() {
        let topics = document.querySelectorAll('.forum_topic_name');
        let blockedCount = 0;
        let patkeyCount = 0;

        let combinedPatterns = TradingForum ? patternSpam : [...patternTrade, ...patternLang, ...patternSpam];

        topics.forEach(topic => {
            let title = topic.textContent.trim();
            let isBlocked = matchesCriteria(title, blocked, []);
            let isPatKey = matchesCriteria(title, keywords, combinedPatterns);

            if (isBlocked) {
                blockedCount++;
            }

            if (isPatKey) {
                patkeyCount++;
            }
        });

        return { blockedCount, patkeyCount };
    }

    function displayCount(blockedCount, patkeyCount) {
        const pagingSummaries = document.querySelectorAll('.forum_paging_summary.ellipsis');

        pagingSummaries.forEach(pagingSummary => {
            let countDisplay = pagingSummary.querySelector('#count-display');

            if (countDisplay) {
                let displayText = '';

                if (blockedCount > 0) {
                    displayText += `${blockedCount} from blocked users`;
                }
                if (patkeyCount > 0 && blockedCount > 0) {
                    displayText += ', ';
                }
                if (patkeyCount > 0) {
                    displayText += `${patkeyCount} spam`;
                }

                countDisplay.textContent = displayText === '' ? '' : ` (${displayText})`;
            } else {
                const newCountDisplay = document.createElement('span');
                newCountDisplay.id = 'count-display';

                let displayText = '';

                if (blockedCount > 0) {
                    displayText += `${blockedCount} from blocked users`;
                }
                if (patkeyCount > 0 && blockedCount > 0) {
                    displayText += ', ';
                }
                if (patkeyCount > 0) {
                    displayText += `${patkeyCount} spam`;
                }

                newCountDisplay.textContent = displayText === '' ? '' : ` (${displayText})`;

                const pageEnd = pagingSummary.querySelector('[id^="forum_General_"][id$="pageend"], [id^="forum_Workshop_"][id$="pageend"], [id^="forum_Trading_"][id$="pageend"]');
                if (pageEnd) {
                    pageEnd.insertAdjacentElement('afterend', newCountDisplay);
                }
            }
        });
    }

    function setVisibleCount() {
        const pageEndSpan = document.querySelector('span[id^="forum_General_"][id$="_pageend"]');
        const pageEndSpanFooter = document.querySelector('span[id^="forum_General_"][id$="_footerpageend"]');

        if (!pageEndSpan || !pageEndSpanFooter) return;

        const totalTopics = parseInt(pageEndSpan.textContent.trim());
        const hiddenTopics = document.querySelectorAll('.forum_topic[style="display: none;"]').length;
        const visibleTopics = totalTopics - hiddenTopics;

        pageEndSpan.textContent = visibleTopics;
        pageEndSpanFooter.textContent = visibleTopics;
    }



    function addNickname(menu) {
        if (!menu || menu.querySelector(".add-nickname")) return;

        const blockBtn = menu.querySelector("a[href*='Forum_BlockUser']");

        if (!blockBtn) return;

        const blockHref = blockBtn.getAttribute("href");
        const match = blockHref.match(/'(\d+)'/);
        if (!match) return;

        const userId = match[1];

        const nicknameAdd = document.createElement("a");
        nicknameAdd.className = "forum_comment_action add-nickname";
        nicknameAdd.href = `https://steamcommunity.com/profiles/${userId}#addnickname`;
        nicknameAdd.target = "_blank";
        nicknameAdd.innerHTML = `
        <img class="nickname-icon" src="https://community.fastly.steamstatic.com/public/images/skin_1/notification_icon_edit_bright.png">
        Add Nickname
        `;

        if (blockBtn) {
            blockBtn.insertAdjacentElement("afterend", nicknameAdd);
        } else {
            menu.appendChild(nicknameAdd);
        }
    }


    function filterTopics(showAll = false, showBlocked = false) {
        let topics = document.querySelectorAll('.forum_topic_name');

        topics.forEach(topic => {
            let title = topic.textContent.trim();
            let combinedPatterns = TradingForum ? patternSpam : [...patternTrade, ...patternLang, ...patternSpam];
            let isBlocked = matchesCriteria(title, blocked, []);
            let isPatKey = matchesCriteria(title, keywords, combinedPatterns);
            let topicElement = topic.closest('.forum_topic');

            if (isBlocked) {
                if (showAll || showBlocked) {
                    topicElement.classList.add('hidden-blocked-user');
                    topicElement.style.display = '';
                } else {
                    topicElement.classList.remove('hidden-blocked-user');
                    topicElement.style.display = 'none';
                }
            } else {
                topicElement.classList.remove('hidden-blocked-user');

                if (showAll) {
                    if (isPatKey) {
                        topicElement.classList.add('hidden-pattern-keyword');
                        topicElement.style.display = '';
                    } else {
                        topicElement.classList.remove('hidden-pattern-keyword');
                        topicElement.style.display = '';
                    }
                } else if (showBlocked) {
                    if (isPatKey) {
                        topicElement.style.display = 'none';
                    } else {
                        topicElement.style.display = '';
                    }
                } else {
                    if (isPatKey) {
                        topicElement.style.display = 'none';
                    } else {
                        topicElement.classList.remove('hidden-pattern-keyword');
                        topicElement.style.display = '';
                    }
                }
            }
        });
        initCounts();
    }

    function extendSections(sectionType) {
        const section = document.querySelector(`.forum_paging.forum_paging_${sectionType}`);
        if (section) {

            const exSections = document.createElement('div');
            exSections.className = `forum_paging forum_paging_${sectionType}_extended`;

            const computedStyles = window.getComputedStyle(section);

            exSections.style.position = 'relative';
            exSections.style.display = 'flex';
            exSections.style.justifyContent = 'space-between';
            exSections.style.lineHeight = computedStyles.lineHeight;
            exSections.style.height = computedStyles.height;
            exSections.style.backgroundColor = computedStyles.backgroundColor;
            exSections.style.borderBottomLeftRadius = computedStyles.borderBottomLeftRadius;
            exSections.style.borderBottomRightRadius = computedStyles.borderBottomRightRadius;
            exSections.style.color = computedStyles.color;
            exSections.style.padding = computedStyles.padding;
            exSections.style.margin = computedStyles.margin;

            if (sectionType === 'header') {
                section.style.borderBottomLeftRadius = '0';
                section.style.borderBottomRightRadius = '0';
                section.style.marginBottom = '0';

                exSections.style.borderTopLeftRadius = '0';
                exSections.style.borderTopRightRadius = '0';
                exSections.style.marginTop = '0';
            } else if (sectionType === 'footer') {
                section.style.borderTopLeftRadius = '0';
                section.style.borderTopRightRadius = '0';
                section.style.marginTop = '0';

                exSections.style.borderBottomLeftRadius = '0';
                exSections.style.borderBottomRightRadius = '0';
                exSections.style.marginBottom = '0';
            }

            if (sectionType === 'header') {
                section.insertAdjacentElement('afterend', exSections);
            } else if (sectionType === 'footer') {
                section.insertAdjacentElement('beforebegin', exSections);
            }

            const buttonContainer = createButtonContainer(
                sectionType === 'header' ? [allHeaderBtn, blockedHeaderBtn] : [allFooterBtn, blockedFooterBtn]
            );
            exSections.appendChild(buttonContainer);

            setPagingCtrls(exSections, sectionType);
        }
    }

    function setHeaderBtns() {
        let pagingHeaderExtended = document.querySelector('.forum_paging_header_extended');

        if (!buttonContainerHeader) {
            buttonContainerHeader = document.createElement('div');
            buttonContainerHeader.classList.add('button-container-header');
        }

        if (pagingHeaderExtended) {
            if (!pagingHeaderExtended.contains(buttonContainerHeader)) {
                pagingHeaderExtended.appendChild(buttonContainerHeader);
            }
        }
    }

    function setFooterBtns() {
        let pagingFooterExtended = document.querySelector('.forum_paging_footer_extended');

        if (!buttonContainerFooter) {
            buttonContainerFooter = document.createElement('div');
            buttonContainerFooter.classList.add('button-container-footer');
        }

        if (pagingFooterExtended) {
            if (!pagingFooterExtended.contains(buttonContainerFooter)) {
                pagingFooterExtended.appendChild(buttonContainerFooter);
            }
        }
    }

    function setPagingCtrls(newElement, controlType) {
        let pagingControls;

        if (controlType === 'footer') {
            pagingControls = document.querySelector('[id^="forum_General_"][id$="_footerpagecontrols"], [id^="forum_Workshop_"][id$="_footerpagecontrols"], [id^="forum_Trading_"][id$="_footerpagecontrols"]');
        } else {
            pagingControls = document.querySelector('[id^="forum_General_"][id$="_pagecontrols"], [id^="forum_Workshop_"][id$="_pagecontrols"], [id^="forum_Trading_"][id$="_pagecontrols"]');
        }

        if (pagingControls && newElement) {
            pagingControls.style.marginLeft = 'auto';
            newElement.appendChild(pagingControls);
        }
    }



    function createButtonStateManager() {
        let showHeaderAll = false;
        let showFooterAll = false;
        let showHeaderBlocked = false;
        let showFooterBlocked = false;

        return {
            toggleHeaderAll() {
                if (!showHeaderAll) {
                    showHeaderBlocked = false;
                    blockedHeaderBtn.classList.remove('active');
                    showFooterBlocked = false;
                    blockedFooterBtn.classList.remove('active');
                }

                showHeaderAll = !showHeaderAll;
                allHeaderBtn.classList.toggle('active', showHeaderAll);
                filterTopics(showHeaderAll, showHeaderBlocked);

                showFooterAll = showHeaderAll;
                allFooterBtn.classList.toggle('active', showFooterAll);
                filterTopics(showFooterAll, showFooterBlocked);
            },

            toggleHeaderBlocked() {
                if (!showHeaderBlocked) {
                    showHeaderAll = false;
                    allHeaderBtn.classList.remove('active');
                    showFooterAll = false;
                    allFooterBtn.classList.remove('active');
                }

                showHeaderBlocked = !showHeaderBlocked;
                blockedHeaderBtn.classList.toggle('active', showHeaderBlocked);
                filterTopics(showHeaderAll, showHeaderBlocked);

                showFooterBlocked = showHeaderBlocked;
                blockedFooterBtn.classList.toggle('active', showFooterBlocked);
                filterTopics(showFooterAll, showFooterBlocked);
            },

            toggleFooterAll() {
                if (!showFooterAll) {
                    showFooterBlocked = false;
                    blockedFooterBtn.classList.remove('active');
                    showHeaderBlocked = false;
                    blockedHeaderBtn.classList.remove('active');
                }

                showFooterAll = !showFooterAll;
                allFooterBtn.classList.toggle('active', showFooterAll);
                filterTopics(showFooterAll, showFooterBlocked);

                showHeaderAll = showFooterAll;
                allHeaderBtn.classList.toggle('active', showHeaderAll);
                filterTopics(showHeaderAll, showHeaderBlocked);
            },

            toggleFooterBlocked() {
                if (!showFooterBlocked) {
                    showFooterAll = false;
                    allFooterBtn.classList.remove('active');
                    showHeaderAll = false;
                    allHeaderBtn.classList.remove('active');
                }

                showFooterBlocked = !showFooterBlocked;
                blockedFooterBtn.classList.toggle('active', showFooterBlocked);
                filterTopics(showFooterAll, showFooterBlocked);

                showHeaderBlocked = showFooterBlocked;
                blockedHeaderBtn.classList.toggle('active', showHeaderBlocked);
                filterTopics(showHeaderAll, showHeaderBlocked);
            },
            getHeaderAll() {
                return showHeaderAll;
            },
            getHeaderBlocked() {
                return showHeaderBlocked;
            },
            getFooterAll() {
                return showFooterAll;
            },
            getFooterBlocked() {
                return showFooterBlocked;
            }
        };
    }

    const buttonManager = createButtonStateManager();

    function createButton(text, className, onClickHandler) {
        const button = document.createElement('button');
        button.innerText = text;
        button.className = className;
        button.addEventListener('click', onClickHandler);
        return button;
    }

    const allHeaderBtn = createButton('All', 'custom-button', buttonManager.toggleHeaderAll);
    const blockedHeaderBtn = createButton('Blocked', 'custom-button', buttonManager.toggleHeaderBlocked);

    const allFooterBtn = createButton('All', 'custom-button', buttonManager.toggleFooterAll);
    const blockedFooterBtn = createButton('Blocked', 'custom-button', buttonManager.toggleFooterBlocked);

    let buttonContainerHeader;
    let buttonContainerFooter;

    function createButtonContainer(buttons) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.alignItems = 'center';

        buttons.forEach(button => buttonContainer.appendChild(button));

        return buttonContainer;
    }



    function initCounts() {
        const { blockedCount, patkeyCount } = countHiddenTopics();
        displayCount(blockedCount, patkeyCount);
    }


    if (window.location.hash === "#addnickname" && typeof ShowNicknameModal === "function") {
        const nicknameElement = document.querySelector(".nickname");
        const existingNickname = nicknameElement ? nicknameElement.textContent.trim() : "";

        ShowNicknameModal(); // Already defined by Steam

        const nicknameObserver = new MutationObserver((mutations, obs) => {
            const nicknameInput = document.querySelector(".newmodal input[type='text']");

            if (nicknameInput) {
                const match = existingNickname.match(/^\((.*)\)$/);
                nicknameInput.value = match ? match[1] : existingNickname;

                obs.disconnect();
            }
        });

        nicknameObserver.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', function() {
        setHeaderBtns();
        setFooterBtns();
    });

    extendSections('header');
    extendSections('footer');
    setHeaderBtns();
    setFooterBtns();
    setPagingCtrls();
    filterTopics();
    initCounts();
    watchUrl();
    setVisibleCount();

    const observer = new MutationObserver((mutations) => {
        let topicsChanged = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains("forum_topic")) {
                    topicsChanged = true;
                }

                if (node.classList && node.classList.contains("forum_comment_action_menu")) {
                    addNickname(node);
                }
            });
        });

        if (topicsChanged) {
            filterTopics(
                buttonManager.getHeaderAll(),
                buttonManager.getHeaderBlocked(),
                buttonManager.getFooterAll(),
                buttonManager.getFooterBlocked()
            );
            setVisibleCount();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
