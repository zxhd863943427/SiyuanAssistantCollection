import { clientApi, pluginInstance as plugin } from "../asyncModules.js";
import { 获取光标所在位置 } from "../utils/rangeProcessor.js";
import { 使用结巴拆分元素 } from "../utils/tokenizer.js";
import { 智能防抖 } from "../utils/functionTools.js"
import { 根据上下文获取动作表 } from '../actionList/getter.js'
import kernelApi from "../polyfills/kernelApi.js";
import { Context } from "./Context.js";
export { 根据上下文获取动作表 as 根据上下文获取动作表 }
function 获取元素所在protyle(element) {
  let { protyles } = plugin
  console.log(protyles)
  return protyles.find(protyle => { 
    return protyle.contentElement.contains(element) 
  })
}

let isComposing = false;
//这一段是token菜单的渲染逻辑
//记录选区位置,如果发生了变化就不再执行后面的逻辑
let controller = new AbortController();
let signal =controller.signal


let 显示token菜单 = (e) => {
  //上下方向键不重新渲染菜单

  if(signal.aborted){
    return
  }
  if (!plugin.块数据集) {
    return
  }
  if (e.code && (e.code === "ArrowUp" || e.code === "ArrowDown")) {
    return
  }
  //如果不是在编辑器里就不渲染了
  const 最近块元素 = plugin.DOM查找器.hasClosestBlock(
    getSelection().getRangeAt(0).commonAncestorContainer
  );
  if (!最近块元素) {
    return
  }
  let block = new plugin.utils.BlockHandler(最近块元素.dataset.nodeId)
  //这个是用来获取光标处token的
  let { pos, editableElement, blockElement, parentElement } = 获取光标所在位置();
  let 分词结果数组 = 使用结巴拆分元素(editableElement).filter((token) => {
    return (token.start <= pos && token.end >= pos) && (token.word && token.word.trim().length > 1);
  }).sort((a, b) => {
    return b.word.length - a.word.length
  });
  if (!分词结果数组[0]) {
    return
  }
  分词结果数组.pos = pos
  分词结果数组.editableElement = editableElement
  分词结果数组.parentElement = parentElement
  分词结果数组.blockElement = blockElement
  分词结果数组.protyle = 获取元素所在protyle(blockElement)
  if (!获取光标底部位置()) {
    return
  }
  const menu = new clientApi.Menu("tokenMenu", async () => {
    // plugin.currentHintAction=null
    menu.menu.element.querySelectorAll('.b3-menu__item').forEach(
      item => {
        if (item.deactive) {
          item.deactive(menu, item)
        }
      }
    );
  });
  监听选中项变化(menu)
  const range = getSelection().getRangeAt(0);
  const 选区位置 = plugin.选区处理器.获取选区屏幕坐标(最近块元素, range);
  plugin.lastTokenArray = 分词结果数组
  //创建一个临时文档片段元素以加快渲染速度
  let time2 = process.hrtime()
  分词结果数组.forEach(
    async (分词结果) => {
      const h3 = process.hrtime()
      /*  let 执行上下文 = {
            blocks: [block],
            token: 分词结果,
            protyle: 获取元素所在protyle(最近块元素).getInstance(),
            menu: menu,
            plugin: plugin,
            kernelApi: plugin.kernelApi,
            clientApi: clientApi,
            eventType: 'blockAction_token',
            allTokens:分词结果数组
        }*/
      let 执行上下文 = new Context([block], 分词结果, 获取元素所在protyle(最近块元素).getInstance(), menu, plugin, kernelApi, clientApi, 'blockAction_token', 分词结果数组)
      const h4 = process.hrtime()
      let 备选动作表 = await 根据上下文获取动作表(执行上下文,signal)
      //console.log('获取动作表耗时', process.hrtime(h4)[1] / 1000000)
      //这一步排序对性能的影响微乎其微
      const h5 = process.hrtime()
      let 菜单动作表 = 备选动作表.filter(item => { return item.hintAction })
      let tips动作表 = 备选动作表.filter(item => { return item.tipRender })
      
      //source\UI\docks\TipsDock.js
      plugin.eventBus.emit('hint_tips',{备选动作表:tips动作表,context:执行上下文})

      let 动作菜单组 = 根据动作序列生成菜单组(菜单动作表, 执行上下文, '分词菜单')
      //      console.log('生成菜单耗时', process.hrtime(h5)[1] / 1000000)
      menu.menu.element.querySelector('.b3-menu__items').appendChild(动作菜单组)
      //      console.log('动作组生成耗时', process.hrtime(h3)[1] / 1000000)
      menu.open({
        x: 选区位置.left + 10,
        y: 获取光标底部位置(),
        isLeft: false,
      });
    }
  )
  plugin.tokenMenu = menu.menu
}

export function findTokenElement(current, range) {
  if (current.nodeType === 1 && current.classList.contains("token")) {
    return current;
  }
  if (current.childNodes.length > 0) {
    for (let i = 0; i < current.childNodes.length; i++) {
      const child = current.childNodes[i];
      const tokenElement = findTokenElement(child, range);
      if (tokenElement) {
        return tokenElement;
      }
    }
  }
  if (range.startContainer === current || range.endContainer === current) {
    return current.parentElement;
  }
  return null;
}
function 获取光标底部位置() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getClientRects()[0];
  return rect ? rect.bottom : null;
}



export const 开始渲染 = () => {
  document.addEventListener('compositionstart', () => {
    isComposing = true;
  },
    { capture: true });
    document.addEventListener(
    "keyup",
    (e) => {
      if (e.code && (e.code === "ArrowUp" || e.code === "ArrowDown")) {
        if (!上下键频率判定(e)) {
          plugin.tokenMenu && plugin.tokenMenu.menu ? plugin.tokenMenu.menu.remove() : null
          return
        }
      }
      controller.abort()
      controller = new AbortController();
      signal=controller.signal
    
      if (!isComposing) {
        // 触发事件的逻辑
        setTimeout(()=>{显示token菜单(e,signal)},100)
      }
    },
    { capture: true, passive: true }
  );

  // 监听 compositionend 事件
  document.addEventListener('compositionend', (e) => {
    isComposing = false;
    controller.abort()
    controller = new AbortController();
    signal=controller.signal

    setTimeout(()=>{显示token菜单(e,signal)},100)

  },
    { capture: true });

}


let observedMenuElements = []
//这里的menu只能传入思源的menus对象
function 监听选中项变化(menu) {
  if (!observedMenuElements.includes(menu.menu.element)) {
    const observer = new MutationObserver((mutationsList, observer) => {
      // 在这里处理选中值变化的逻辑
      const 选中项 = menu.menu.element.querySelector('.b3-menu__item--current');
      plugin.currentHintAction = 选中项
      menu.menu.element.querySelectorAll('.b3-menu__item:not(.b3-menu__item--current)').forEach(
        item => {
          if ((item !== 选中项) && item.deactive) {
            item.deactive(menu, item)
          }
        }
      );
      if (选中项 && 选中项.active) {
        选中项.active(menu, 选中项)
      }

    });
    observer.observe(menu.menu.element, { attributes: true, subtree: true });
    observedMenuElements.push(menu.menu.element)
  }
}


const 根据上下文生成动作菜单项 = (执行上下文, 动作, 触发事件类型) => {
  let 菜单项文字内容 = 动作.label[window.siyuan.config.lang] || 动作.label.zh_CN || 动作.label
  if (菜单项文字内容 instanceof Function) {
    菜单项文字内容 = 动作.label(执行上下文)
    菜单项文字内容 = 菜单项文字内容[window.siyuan.config.lang] || 菜单项文字内容.zh_CN || 菜单项文字内容
  }
  let 菜单项元素 = 生成元素(
    'button',
    {
      class: "b3-menu__item"
    },
    `<svg class="b3-menu__icon" style="">
        <use xlink:href="#${Lute.EscapeHTMLStr(动作.icon)}"></use>
      </svg>
      <span class="b3-menu__label"
      style='  display: inline-block;
      width: 200px; 
      white-space: nowrap; 
      overflow: hidden;
      text-overflow: ellipsis; 
    '
      >${菜单项文字内容}</span>`
    ,
    {
      click: () => { 执行动作(动作, 执行上下文, 触发事件类型) }
    }
  )
  菜单项元素.token = 执行上下文.token
  菜单项元素.active = 动作.active
  菜单项元素.deactive = 动作.deactive
  菜单项元素.runAction = () => {
    执行动作(动作, 执行上下文, '分词菜单')
  }
  return 菜单项元素
}
const 执行动作 = async (动作, context, 触发事件类型) => {
  if (触发事件类型 == '分词菜单') {
    if (动作.hintAction) {
      await 动作.hintAction(context);
    } else if (动作.分词动作) {
      await 动作.分词动作(context);
    }
  } else {
    if (动作.blockAction) {
      await 动作.blockAction(context);
    } else if (动作.块动作) {
      await 动作.块动作(context);
    }
  }
  plugin.命令历史.push(动作);
  动作.lastContext = context;
}



//对命令进行排序
//Levenshtein距离是一种用于计算两个字符串之间的相似度的算法。
//它衡量了将一个字符串转换为另一个字符串所需的最少编辑操作次数，包括插入、删除和替换字符。

export function 根据动作序列生成菜单组(动作序列, 执行上下文, 触发事件类型) {
  let 子菜单元素片段 = document.createDocumentFragment();
  动作序列.forEach(
    (动作) => {
      try {
        let 动作菜单项 = 根据上下文生成动作菜单项(执行上下文, 动作, 触发事件类型)
        子菜单元素片段.appendChild(动作菜单项)
      } catch (e) {
        console.log(执行上下文, 动作, e)
      }
    }
  )
  return 子菜单元素片段
}


// 对事件触发进行智能防抖
const averageExecutionTime = 100; // 平均执行时间，单位为毫秒
// 监听 compositionstart 事件
let 判定次数 = 0
let 上下键频率判定 = 智能防抖((e) => {
  if (e.code && (e.code === "ArrowUp" || e.code === "ArrowDown")) {
    if (判定次数 < 4) {
      判定次数 += 1
      return true
    } else {
      判定次数 = 0
      return true
    }

  }
}, undefined, 1000 / 6)
function 生成元素(tag名, 属性配置, html, 事件配置) {
  let 元素 = document.createElement(tag名)
  Object.getOwnPropertyNames(属性配置).forEach(
    prop => {
      元素.setAttribute(prop, 属性配置[prop])
    }
  )
  Object.getOwnPropertyNames(事件配置).forEach(
    事件名 => {
      元素.addEventListener(事件名, 事件配置[事件名])
    }
  )
  元素.insertAdjacentHTML('beforeEnd', html)
  return 元素
}