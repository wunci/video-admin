$(function(){
  $('select.dropdown').dropdown()
  function redirect() {
    window.location.href='/'
  }
  $('.ui.form')
  .form({
    inline : true,
    on  : 'blur',
    onSuccess: redirect
     ,
    fields: {
      name: {
        identifier: 'video-name',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入名称！'
          }
        ]
      },
      country: {
        identifier: 'video-country',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入国家！'
          }
        ]
      },
      classify: {
        identifier: 'video-classify',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入分类！'
          }
        ]
      },
      time: {
        identifier: 'video-time',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入时间！'
          }
        ]
      },
      file: {
        identifier: 'file',
        rules: [
          {
            type   : 'empty',
            prompt : '请上传图片！'
          }
        ]
      },
      star: {
        identifier: 'video-star',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入评分！'
          }
        ]
      },
      timelong: {
        identifier: 'video-time-long',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入时长！'
          }
        ]
      },
      type: {
        identifier: 'video-type',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入类型！'
          }
        ]
      },
      actors: {
        identifier: 'video-actors',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入导演和演员！'
          }
        ]
      },
      detail: {
        identifier: 'video-detail',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入描述！'
          }
        ]
      }, 
    }
  })
;
})