// ==UserScript==
// @name         Steamcommunity-CleanUp
// @namespace    https://github.com/veehawt/Steamcommunity-CleanUp
// @version      0.3.2
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
        /\bopen (?:inventory|inv|trade)\b/i, // "open inventory/trade"
    ];

    // Regex language patterns in topic titles and topic comments to hide (disabled on trade forums)
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
        /[ảạằắẳẵặỉĩịỏọồốổỗộờớởỡợủũụưừứửữựỷỹỵđ]/i, // Vietnamese
        /[\u0370-\u03FF]/, // Greek
        /[ğşşçıİĞŞÇ]/, // some Turkish characters aiming to hide Turkish topics
        /[ÄäÖöÜü]/, // additional Turkish letters but also German, Estonian, Finnish and Hungarian
        /[ŐőŰű]/, // Hungarian
        /[Łł]/, // Polish
        /[ÆæØøÅåÞþÐð]/, // Nordic (Danish, Finnish, Icelandic, Norwegian and Swedish)
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
        .hidden-pattern-keyword-comment {
            background-color: rgba(67, 47, 67, 0.5) !important;
        }
        .hidden-blocked-user {
            border-left: 2px solid #f84972;
            border-right: 2px solid #f84972;
            background-color: rgba(118, 85, 116, 0.5);
        }
        .hidden-blocked-user:hover {
            background-color: rgba(141, 102, 139, 0.8);
        }
        .hidden-blocked-user-comment {
            background-color: #2b2230 !important;
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



    function matchesCriteria(text, keywordList, patternList) {
        for (let keyword of keywordList) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                return true;
            }
        }

        for (let pattern of patternList) {
            if (pattern.test(text)) {
                return true;
            }
        }

        return false;
    }

    function countHiddenContent() {
        let blockedCount = 0;
        let patkeyCount = 0;

        let combinedPatterns = TradingForum ? patternSpam : [...patternTrade, ...patternLang, ...patternSpam];

        let isCommentSection = !!document.querySelector('.commentthread_comments');

        if (!isCommentSection) {
            let topics = document.querySelectorAll('.forum_topic');

            topics.forEach(topic => {
                if (topic.closest('.rightSectionTopTitle')) return;

                let topicName = topic.querySelector('.forum_topic_name');
                if (!topicName) return;

                let text = topicName.textContent.trim();
                let isBlockedTopic = matchesCriteria(text, blocked, []);
                let isPatKeyTopic = matchesCriteria(text, keywords, combinedPatterns);

                if (isBlockedTopic) blockedCount++;
                if (isPatKeyTopic) patkeyCount++;
            });

        } else {
            let comments = document.querySelectorAll('.commentthread_comment');

            let commentPatterns = [...patternLang, ...patternSpam];

            comments.forEach(comment => {
                let textElement = comment.querySelector('.commentthread_comment_text');
                if (!textElement) return;

                let rawText = textElement.innerHTML;
                let text = textElement.textContent.trim();
                let cleanedText = rawText.replace(/<blockquote.*?>.*?<\/blockquote>/gis, '').trim();

                let isBlockedComment = comment.classList.contains('commentthread_deleted_expanded');

                if (isBlockedComment) {
                    blockedCount++;
                    return;
                }

                let isPatKeyComment = matchesCriteria(cleanedText, [], commentPatterns);

                if (isPatKeyComment) {
                    patkeyCount++;
                }
            });
        }
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

                const pageEnd = pagingSummary.querySelector(
                    '[id^="forum_General_"][id$="pageend"], ' +
                    '[id^="forum_Workshop_"][id$="pageend"], ' +
                    '[id^="forum_Trading_"][id$="pageend"], ' +
                    '[id^="commentthread_ForumTopic_"][id$="_pageend"], ' +
                    '[id^="commentthread_ForumTopic_"][id$="_fpageend"]'
                );
                if (pageEnd) {
                    pageEnd.insertAdjacentElement('afterend', newCountDisplay);
                }
            }
        });
    }

    let lastHiddenCount = 0;

    function setVisibleCount() {
        const pageEndSpan = document.querySelector(
            'span[id^="forum_General_"][id$="_pageend"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_pageend"]'
        );
        const pageEndSpanFooter = document.querySelector(
            'span[id^="forum_General_"][id$="_footerpageend"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_fpageend"]'
        );

        if (!pageEndSpan || !pageEndSpanFooter) return;

        let totalCount = parseInt(pageEndSpan.textContent.trim()) || 0;
        let isCommentSection = document.querySelector('.commentthread_comment') !== null;

        let hiddenCount = isCommentSection
        ? document.querySelectorAll('.commentthread_comment[style="display: none;"]').length
        : document.querySelectorAll('.forum_topic[style="display: none;"]').length;

        if (hiddenCount !== lastHiddenCount) {
            let visibleCount = Math.max(0, totalCount - hiddenCount);

            pageEndSpan.textContent = visibleCount;
            pageEndSpanFooter.textContent = visibleCount;

            lastHiddenCount = hiddenCount;
        }
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
            let topicElement = topic.closest('.forum_topic');

            let combinedPatterns = TradingForum ? patternSpam : [...patternTrade, ...patternLang, ...patternSpam];

            let isBlocked = matchesCriteria(title, blocked, []);
            let isPatKey = matchesCriteria(title, keywords, combinedPatterns);

            topicElement.classList.remove('hidden-blocked-user', 'hidden-pattern-keyword');

            if (isBlocked) {
                topicElement.style.display = showAll || showBlocked ? '' : 'none';
                if (showAll || showBlocked) topicElement.classList.add('hidden-blocked-user');
                return;
            }

            if (isPatKey) {
                topicElement.style.display = showAll ? '' : 'none';
                if (showAll) topicElement.classList.add('hidden-pattern-keyword');
                return;
            }

            topicElement.style.display = '';
        });
        initCounts();
    }

    function filterComments(showAll = false, showBlocked = false) {
        let comments = document.querySelectorAll('.commentthread_comment');

        comments.forEach(comment => {
            if (comment.classList.contains('commentthread_deleted_comment')) {
                comment.remove();
                return;
            }

            let textElement = comment.querySelector('.commentthread_comment_text');
            if (!textElement) return;

            let textClone = textElement.cloneNode(true);
            textClone.querySelectorAll('blockquote').forEach(blockquote => blockquote.remove());
            let text = textClone.textContent.trim();
            let commentPatterns = [...patternLang, ...patternSpam];

            let isBlockedComment = comment.classList.contains('commentthread_deleted_expanded');
            let isPatKeyComment = matchesCriteria(text, [], commentPatterns);

            comment.classList.remove('hidden-blocked-user-comment', 'hidden-pattern-keyword-comment');

            if (isBlockedComment) {
                comment.style.display = showAll || showBlocked ? '' : 'none';
                if (showAll || showBlocked) comment.classList.add('hidden-blocked-user-comment');
                return;
            }

            if (isPatKeyComment) {
                comment.style.display = showAll ? '' : 'none';
                if (showAll) comment.classList.add('hidden-pattern-keyword-comment');
                return;
            }

            comment.style.display = '';
        });
        initCounts();
    }

    function extendSections(sectionType) {
        let querySelector = `.forum_paging.forum_paging_${sectionType}`;

        if (sectionType === 'pagectn' || sectionType === 'fpagectn') {
            querySelector = `.forum_paging[id$='_${sectionType}']`;
        }

        const sections = document.querySelectorAll(querySelector);

        sections.forEach((section) => {
            if (!section || window.getComputedStyle(section).display === 'none') {
                return;
            }

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

            if (sectionType === 'header' || sectionType === 'pagectn') {
                section.style.borderBottomLeftRadius = '0';
                section.style.borderBottomRightRadius = '0';
                section.style.marginBottom = '0';

                exSections.style.borderTopLeftRadius = '0';
                exSections.style.borderTopRightRadius = '0';
                exSections.style.marginTop = '0';
            } else if (sectionType === 'footer' || sectionType === 'fpagectn') {
                section.style.borderTopLeftRadius = '0';
                section.style.borderTopRightRadius = '0';
                section.style.marginTop = '0';

                exSections.style.borderBottomLeftRadius = '0';
                exSections.style.borderBottomRightRadius = '0';
                exSections.style.marginBottom = '0';
            }

            if (sectionType === 'header' || sectionType === 'pagectn') {
                section.insertAdjacentElement('afterend', exSections);
            } else if (sectionType === 'footer' || sectionType === 'fpagectn') {
                section.insertAdjacentElement('beforebegin', exSections);
            }

            let buttonContainer;
            if (sectionType === 'header' || sectionType === 'pagectn') {
                buttonContainer = createButtonContainer([allHeaderBtn, blockedHeaderBtn]);
            } else if (sectionType === 'footer' || sectionType === 'fpagectn') {
                buttonContainer = createButtonContainer([allFooterBtn, blockedFooterBtn]);
            }

            if (buttonContainer) {
                exSections.appendChild(buttonContainer);
            }

            setPagingCtrls(exSections, sectionType);
        });
    }

    function setHeaderBtns() {
        let pagingHeaderExtended = document.querySelector('.forum_paging_header_extended');
        let pagingPageCtnExtended = document.querySelector('.forum_paging_pagectn_extended');

        if (!buttonContainerHeader) {
            buttonContainerHeader = document.createElement('div');
            buttonContainerHeader.classList.add('button-container-header');
        }

        if (pagingHeaderExtended && !pagingHeaderExtended.contains(buttonContainerHeader)) {
            pagingHeaderExtended.appendChild(buttonContainerHeader);
        }

        if (pagingPageCtnExtended && !pagingPageCtnExtended.contains(buttonContainerHeader)) {
            pagingPageCtnExtended.appendChild(buttonContainerHeader);
        }
    }

    function setFooterBtns() {
        let pagingFooterExtended = document.querySelector('.forum_paging_footer_extended');
        let pagingFPageCtnExtended = document.querySelector('.forum_paging_fpagectn_extended');

        if (!buttonContainerFooter) {
            buttonContainerFooter = document.createElement('div');
            buttonContainerFooter.classList.add('button-container-footer');
        }

        if (pagingFooterExtended && !pagingFooterExtended.contains(buttonContainerFooter)) {
            pagingFooterExtended.appendChild(buttonContainerFooter);
        }

        if (pagingFPageCtnExtended && !pagingFPageCtnExtended.contains(buttonContainerFooter)) {
            pagingFPageCtnExtended.appendChild(buttonContainerFooter);
        }
    }

    function setPagingCtrls(newElement, controlType) {
        let pagingControls;

        if (controlType === 'header' || controlType === 'pagectn') {
            pagingControls = document.querySelector(
                '[id^="forum_General_"][id$="_pagecontrols"], ' +
                '[id^="forum_Workshop_"][id$="_pagecontrols"], ' +
                '[id^="forum_Trading_"][id$="_pagecontrols"], ' +
                '[id^="commentthread_ForumTopic_"][id$="_pagecontrols"]'
            );
        } else if (controlType === 'footer' || controlType === 'fpagectn') {
            pagingControls = document.querySelector(
                '[id^="forum_General_"][id$="_footerpagecontrols"], ' +
                '[id^="forum_Workshop_"][id$="_footerpagecontrols"], ' +
                '[id^="forum_Trading_"][id$="_footerpagecontrols"], ' +
                '[id^="commentthread_ForumTopic_"][id$="_fpagecontrols"]'
            );
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

        function applyFilters() {
            filterTopics(showHeaderAll, showHeaderBlocked);
            filterComments(showHeaderAll, showHeaderBlocked);
        }

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
                showFooterAll = showHeaderAll;
                allFooterBtn.classList.toggle('active', showFooterAll);

                applyFilters();
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
                showFooterBlocked = showHeaderBlocked;
                blockedFooterBtn.classList.toggle('active', showFooterBlocked);

                applyFilters();
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
                showHeaderAll = showFooterAll;
                allHeaderBtn.classList.toggle('active', showHeaderAll);

                applyFilters();
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
                showHeaderBlocked = showFooterBlocked;
                blockedHeaderBtn.classList.toggle('active', showHeaderBlocked);

                applyFilters();
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
        const { blockedCount, patkeyCount } = countHiddenContent();
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
    extendSections('pagectn');
    extendSections('fpagectn');
    setHeaderBtns();
    setFooterBtns();
    setPagingCtrls();
    filterTopics();
    filterComments();
    initCounts();
    watchUrl();
    setVisibleCount();


    const observeMenuVisibility = () => {
        document.querySelectorAll(".forum_comment_action_menu").forEach((menu) => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === "style" && menu.style.display !== "none") {
                        console.log("Menu became visible:", menu);
                        addNickname(menu);
                    }
                });
            });

            observer.observe(menu, { attributes: true, attributeFilter: ["style"] });
        });
    };
    observeMenuVisibility();


    const menuContainer = document.body;
    const menuObserver = new MutationObserver(() => {
        observeMenuVisibility();
    });

    menuObserver.observe(menuContainer, { childList: true, subtree: true });


    const observer = new MutationObserver((mutations) => {
        let topicsChanged = false;
        let commentsChanged = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains("forum_topic")) {
                    topicsChanged = true;
                }

                if (node.classList && (node.classList.contains("commentthread_comment") || node.classList.contains("commentthread_deleted_expanded"))) {
                    commentsChanged = true;
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
        }

        if (commentsChanged) {
            filterComments(
                buttonManager.getHeaderAll(),
                buttonManager.getHeaderBlocked(),
                buttonManager.getFooterAll(),
                buttonManager.getFooterBlocked()
            );
        }

        setVisibleCount();
    });

    const forumContainer = document.querySelector('.forum_topics_container');
    const commentSection = document.querySelector('.commentthread_comment_container');

    if (forumContainer) {
        observer.observe(forumContainer, { childList: true, subtree: true });
    }

    if (commentSection) {
        observer.observe(commentSection, { childList: true, subtree: true });
    }
})();