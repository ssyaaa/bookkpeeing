// miniprogram/pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 记账类型
    bookkeepingData:[],
    x:[1,2],
    // 轮播图配置
    swiperOption:{
      indicatorDots:true,
      indicatorActiveColor:'#fedb5b',
      indicatorColor:'#8a8a8a'
    },
    // 标签数据
    tabData:[
      {
        title:'收入',
        isActive:true,
        type:"shouru"
      },
      {
        title: '支出',
        isActive: false,
        type:"zhichu"
      }
    ],
    // 账户选择
    acountData:[
      {title:'现金',isActive:true,type:"xianjin"},
      {title:'微信钱包',isActive:false,type:"weixin"},
      {title: '支付宝', isActive: false, type:"zhifubao"},
      {title:'储蓄卡',isActive:false,type:"chuxuka"},
      {title:'信用卡',isActive:false,type:"xinyongka"}
    ],
    info:{
      date:'请选择记账日期',
      meney:'',
      comment:''
    },
    // 选择日期范围
    dateRange: {
      // 开始日期
      start: '',
      // 结束日期
      end: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setDate();
    this.getBookKeepingType();
    
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  // 切换标签
  toggleTab: function(e){
    if (e.currentTarget.dataset.active){
        return;
    }
    let dataName = e.currentTarget.dataset.datas;
    let tabData = this.data[dataName];

    for(let i = 0 ; i < tabData.length; i++){
      if(tabData[i].isActive){
        tabData[i].isActive = false;
        break;
      }
    }
    tabData[e.currentTarget.dataset.index].isActive = true;

    this.setData({
      [dataName]:tabData
    })
  },
  // 选择记账类型
  selectBookKeepingType :function(e){
    console.log(e);
    let data = e.currentTarget.dataset;
    if (data.active){
      return;
    }
    let bookkeepingData = this.data.bookkeepingData;
    for (let i = 0; i < bookkeepingData.length;i++){
      if (bookkeepingData[i].selected){
        bookkeepingData[i].selected = false;
        break;
      }
    }
    bookkeepingData[data.index].selected = true;
    this.setData({
      bookkeepingData
    })
  },
  // 设置开始日期结束日期
  setDate(){
    // 设置开始日期，结束日期
    // 获取当前日期
    let currentDate = new Date().toLocaleDateString().split("/");
    // 开始日期
    let start = currentDate[0] - 1 + '-' + currentDate[1] + '-' + currentDate[2];
    let end = currentDate.join('-');
    // 数据响应 如果不设置，wxml无法实现数据响应
    this.setData({
      dateRange: {
        start,
        end
      }
    })
  },
  // 获取记账分类
  getBookKeepingType:function(){
    wx.showLoading({
      title: '加载中',
    })
    // 调用云函数[get_book_keeping],获取记账类型数据
    wx.cloud.callFunction({
      name: 'get_book_keeping',
      // 参数
      data: {},
      // 请求成功
      success: res => {
        wx.hideLoading();
        console.log("res==>", res);
        res.result.data.forEach(v => {
          v.selected = false;
        })
        this.setData({
          bookkeepingData: res.result.data
        })
      },
      // 请求成功
      fail: err => {
        wx.hideLoading();
        console.log("err==>", err);
      }
    })
  },
  // 获取输入内容
  getInfo:function(e){
    console.log(e);
    this.data.info[e.currentTarget.dataset.title] = e.detail.value;
    this.setData({
      info: this.data.info
    })
  },
  // 记账
  bookKeeping:function(){
    let data = {};
    // 获取收入类型或支出类型
    for (let i = 0; i < this.data.tabData.length;i++){
      if (this.data.tabData[i].isActive){
        data.cost = this.data.tabData[i].title;
        data.costType = this.data.tabData[i].type;                                                                                                      
      }
    }
    // 获取记账类型
    let isSelect = false;
    for (let i = 0; i < this.data.bookkeepingData.length; i++){
      if (this.data.bookkeepingData[i].selected){
        data.id = this.data.bookkeepingData[i]._id;
        data.type = this.data.bookkeepingData[i].type;
        data.title = this.data.bookkeepingData[i].title;
        data.icon = this.data.bookkeepingData[i].icon_url;
        isSelect = true;
        break;
      }
    }
    if(!isSelect){
      // 提示选择记账类型
      wx.showToast({
        title: '请选择记账类型',
        icon:'none',
        duration:2000,
        mask:true
      })
    }
    // 获取账户类型
    for (let i = 0; i < this.data.acountData.length; i++){
      if(this.data.acountData[i].isActive){
        data.account = this.data.acountData[i].title;
        data.accountType = this.data.acountData[i].type;
        break;
      }
    }
    // 判断日期是否选择
    if (this.data.info.date == '请选择记账日期'){
      // 提示选择记账日期
      wx.showToast({
        title: '请选择记账日期',
        icon:'none',
        duration:2000,
        mark:true
      })
      return;
    }else if(this.data.info.meney == ''){
      wx.showToast({
        title: '请填写金额',
        icon: 'none',
        duration: 2000,
        mark: true
      })
      return;
    }
    for(let key in this.data.info){
      data[key] = this.data.info[key];
    }

    // -------------------------------------------
    wx.showLoading({
      title: '加载中',
    })
    // 调用云函数[get_book_keeping],添加记账类型数据
    wx.cloud.callFunction({
      name: 'add_book_keeping_data',
      // 参数
      data,
      // 请求成功
      success: res => {
        wx.hideLoading();
        console.log("res【add_book_keeping】==>", res);
        wx.showToast({
          title: '保存成功',
          success:'success',
          duration:200
        })
      },
      // 请求失败
      fail: err => {
        wx.hideLoading();
        console.log("err==>", err);
      }
    })

    console.log("data==>",data);
  }
})