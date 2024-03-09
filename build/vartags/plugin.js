(function () {
  'use strict';
  const vartagIcon =
    '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 6C3 4.34315 4.34315 3 6 3C6.55228 3 7 3.44772 7 4C7 4.55228 6.55228 5 6 5C5.44772 5 5 5.44772 5 6V9.93845C5 10.7267 4.69282 11.457 4.1795 12C4.69282 12.543 5 13.2733 5 14.0616V18C5 18.5523 5.44772 19 6 19C6.55228 19 7 19.4477 7 20C7 20.5523 6.55228 21 6 21C4.34315 21 3 19.6569 3 18V14.0616C3 13.6027 2.6877 13.2027 2.24254 13.0914L1.75746 12.9701C1.3123 12.8589 1 12.4589 1 12C1 11.5411 1.3123 11.1411 1.75746 11.0299L2.24254 10.9086C2.6877 10.7973 3 10.3973 3 9.93845V6ZM21 6C21 4.34315 19.6569 3 18 3C17.4477 3 17 3.44772 17 4C17 4.55228 17.4477 5 18 5C18.5523 5 19 5.44772 19 6V9.93845C19 10.7267 19.3072 11.457 19.8205 12C19.3072 12.543 19 13.2733 19 14.0616V18C19 18.5523 18.5523 19 18 19C17.4477 19 17 19.4477 17 20C17 20.5523 17.4477 21 18 21C19.6569 21 21 19.6569 21 18V14.0616C21 13.6027 21.3123 13.2027 21.7575 13.0914L22.2425 12.9701C22.6877 12.8589 23 12.4589 23 12C23 11.5411 22.6877 11.1411 22.2425 11.0299L21.7575 10.9086C21.3123 10.7973 21 10.3973 21 9.93845V6ZM9.28935 6.88606C8.95028 6.45011 8.32201 6.37158 7.88606 6.71065C7.45011 7.04972 7.37158 7.67799 7.71065 8.11394L10.7331 12L7.71065 15.8861C7.37158 16.322 7.45011 16.9503 7.88606 17.2894C8.32201 17.6284 8.95028 17.5499 9.28935 17.1139L12 13.6288L14.7106 17.1139C15.0497 17.5499 15.678 17.6284 16.1139 17.2894C16.5499 16.9503 16.6284 16.322 16.2894 15.8861L13.2669 12L16.2894 8.11394C16.6284 7.67799 16.5499 7.04972 16.1139 6.71065C15.678 6.37158 15.0497 6.45011 14.7106 6.88606L12 10.3712L9.28935 6.88606Z" fill-rule="nonzero"/></svg>';
  const vartagStyle =
    '.vartag__item {background-color: #006ce7;color: #FFF;padding: 2px 5px;border-radius: 3px;font-weight: bold;display: inline-block;border: 0;}';
  const vartag = {
    super: 'vartags',
    class: 'vartag__item',
    ids: {
      icon: 'vartagsicon',
      btn: 'vartagsbtn',
      autocomplete: 'vartagsautocompleter',
      items: 'vartags_items',
      prefix: 'vartags_prefix',
      suffix: 'vartags_suffix'
    },
    select: {
      nodes: 'childNodes',
      body: 'body'
    },
    event: {
      init: 'init',
      content: 'beforegetcontent',
      close: 'CloseWindow'
    }
  };
  const utils = {
    isObject: (param) => {
      return param && typeof param === 'object';
    },
    isValidObject: (param) => {
      return (
        utils.isObject(param) &&
        'title' in param &&
        ('value' in param || 'menu' in param)
      );
    },
    isValidArray: (param) => {
      return param && Array.isArray(param) && param.length >= 1;
    },
    isString: (param) => {
      return param && typeof param === 'string';
    },
    isValidPrefixAndSuffix: (prefix, suffix) => {
      const _prefix = prefix.trim();
      const _suffix = suffix.trim();
      let isPrefixValid = utils.isString(_prefix) && _prefix.length === 2;
      let isSuffixValid = utils.isString(_suffix) && _suffix.length === 2;
      return isPrefixValid && isSuffixValid;
    },
    clean: (param) => {
      param = param.trim();
      return param.replace(/[^a-zA-Z0-9._]/g, '');
    },
    validateItems: (items) => {
      if (!utils.isValidArray(items)) return false;
      for (const item of items) {
        if (!utils.isValidObject(item)) return false;
        if (item.menu && !utils.isValidArray(item.menu)) return false;
        if (item.menu && !utils.validateItems(item.menu)) return false;
      }
      return true;
    },
    textIncludesData: (text, array) => {
      if (!utils.isString(text) || !utils.isValidArray(array)) return [];
      return array.filter((data) => text.includes(data));
    }
  };
  const Plugin = (editor) => {
    const items = editor.getParam(vartag.ids.items, []);
    const prefix = editor.getParam(vartag.ids.prefix, '{{');
    const suffix = editor.getParam(vartag.ids.suffix, '}}');
    if (
      !utils.validateItems(items) ||
      !utils.isValidPrefixAndSuffix(prefix, suffix)
    )
      return editor;
    const getTagText = (value) => {
      return `${prefix.trim()}${value}${suffix.trim()}`;
    };
    const getTagHTML = (value) => {
      return `<span class="${vartag.class}" contenteditable="false">${value}</span>`;
    };
    const getValues = (items) => {
      const values = [];
      const getRecursiveValues = (item) => {
        if (item.value) {
          values.push(getTagText(utils.clean(item.value)));
        }
        if (item.menu) {
          item.menu.forEach((subItem) => getRecursiveValues(subItem));
        }
      };
      items.forEach((item) => getRecursiveValues(item));
      return [...new Set(values)];
    };
    const validVars = getValues(items);
    const addVariable = (value) => {
      value = getTagText(value);
      value = getTagHTML(value);
      editor.insertContent(value);
    };
    const generateOption = (item) => {
      if ('menu' in item) {
        return generateMenuOption(item);
      } else if ('value' in item) {
        return generateSimpleOption(item);
      } else {
        return null;
      }
    };
    const generateSimpleOption = (item) => {
      return {
        type: 'menuitem',
        text: item.title.trim(),
        onAction: (_) => addVariable(utils.clean(item.value.trim()))
      };
    };
    const generateMenuOption = (item) => {
      if (!utils.isValidArray(item.menu)) return false;
      return {
        type: 'nestedmenuitem',
        text: item.title.trim(),
        getSubmenuItems: () => getOptions(item.menu)
      };
    };
    const getOptions = (items) => {
      return items.map(generateOption).filter((option) => option !== null);
    };
    const HTMLToStr = () => {
      const body = editor.getBody();
      tinymce.walk(
        body,
        (node) => {
          if (!node.nodeValue || !validVars.includes(node.nodeValue)) return;
          node.parentNode.insertAdjacentText('afterend', node.nodeValue);
          node.parentNode.remove();
        },
        vartag.select.nodes
      );
      editor.dom.setHTML(
        tinymce.activeEditor.dom.select(vartag.select.body),
        body.innerHTML
      );
    };
    const strToHTML = () => {
      const body = editor.getBody();
      tinymce.walk(
        body,
        (node) => {
          if (node.parentNode.classList.contains(vartag.class)) return;
          let value = node.nodeValue;
          const variables = utils.textIncludesData(value, validVars);
          if (variables.length > 0) {
            variables.forEach((variable) => {
              value = value.replace(variable, getTagHTML(variable));
            });
            node.nodeValue = value;
          }
        },
        vartag.select.nodes
      );
      editor.dom.setHTML(
        tinymce.activeEditor.dom.select(vartag.select.body),
        editor.dom.decode(body.innerHTML)
      );
    };
    const handleContentRerender = (e) => {
      return e.format === 'raw' ? strToHTML() : HTMLToStr();
    };
    const setStyle = (e) => {
      e.target.dom.addStyle(vartagStyle);
    };
    const getAutocompleteItems = () => {
      const result = [];
      const exploreNodes = (node) => {
        if ('value' in node) {
          result.push({
            type: 'autocompleteitem',
            value: node.value.trim(),
            text: node.title.trim()
          });
        }
        if ('menu' in node) {
          node.menu.forEach(exploreNodes);
        }
      };
      items.forEach(exploreNodes);
      return result;
    };
    const char = prefix.trim().substring(0, 1);
    editor.ui.registry.addIcon(vartag.ids.icon, vartagIcon);
    editor.ui.registry.addMenuButton(vartag.ids.btn, {
      icon: vartag.ids.icon,
      fetch: (callback) => callback(getOptions(items))
    });
    editor.ui.registry.addAutocompleter(vartag.ids.autocomplete, {
      trigger: char,
      ch: char,
      minChars: 1,
      columns: 1,
      onAction: (autocompleteApi, rng, value) => {
        editor.selection.setRng(rng);
        addVariable(value);
        autocompleteApi.hide();
      },
      fetch: (pattern) => {
        return new Promise((resolve) => {
          const results = getAutocompleteItems();
          resolve(results);
        });
      }
    });
    editor.on(vartag.event.init, setStyle);
    editor.on(vartag.event.content, handleContentRerender);
    editor.on(vartag.event.close, (e) => strToHTML());
    return editor;
  };
  if (!window.tinymce) {
    throw new Error('The "tinymce" is undeclared.');
  }
  window.tinymce.PluginManager.add(vartag.super, function (editor, url) {
    return Plugin(editor);
  });
})();
