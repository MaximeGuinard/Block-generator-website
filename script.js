let App = new Vue({
  el: '#App',
  
  data: {
    colors: [
      [121,  85,  72],
      [  0, 150, 136],
      [ 76, 175,  80],
    ],
    selectedTexture: [5, 5, 2],
    baseURL: 'https://rawgit.com/TecIce/Block-generator/master/src/layer'
  },
  
  methods: {
    drawTexture(layer, texture, topSide, callback) {
      let vm = this
      Vue.set(this.selectedTexture, layer, texture)
      
      $('#textureModel').draw({ fn(ctx) {
        let posX = 16 * layer

        ctx.imageSmoothingEnabled = false
        ctx.clearRect(posX, 0, 32, 32)
        
        Array(2).fill().map( (e, i) => {
          topSide = topSide ? `_${i + 1}` : false
          Object.assign(new Image(), {
           src: `${vm.baseURL + (layer + 1)}/${texture + topSide}.png`,
           crossOrigin: "Anonymous",
            onload: function() {
              ctx.drawImage(this, posX, 16 * i, 16, 16)
              vm.colorFilter(layer)
              
              if(callback) callback.call()
            }
          })
        })
      } })
    },
    
    colorFilter(layer) {
      let posX = 16 * layer
      let vm   = this
      $('#textureModel').draw({ fn(ctx) {
        let data = ctx.getImageData(posX, 0, 16, 32).data
        let collored = ctx.getImageData(posX, 32, 16, 32)
        
        for(let i = 0; i < data.length; i+=4){
          collored.data[i]     = data[i]     - (255 - vm.colors[layer][0])
          collored.data[i + 1] = data[i + 1] - (255 - vm.colors[layer][1])
          collored.data[i + 2] = data[i + 2] - (255 - vm.colors[layer][2])
          collored.data[i + 3] = data[i + 3]
        }
        ctx.putImageData(collored, posX, 32)
        vm.updateCube()
      } })
    },
    
    updateCube() {
      $('canvas.face-top, canvas.face-left, canvas.face-right').each(function(i) {
        $(this).draw({ fn: ctx => {
          ctx.imageSmoothingEnabled = false
          let posY = $(this).hasClass('face-top') ? -450 : -300
          
          Object.assign(new Image(), {
            src: $('#textureModel').getCanvasImage(),
            crossOrigin: "Anonymous",
            onload: function() {
              ctx.drawImage(this,    0, posY, 450, 600)
              ctx.drawImage(this, -150, posY, 450, 600)
              ctx.drawImage(this, -300, posY, 450, 600)
            }
          })
        } })
      })
    },
    
    clearLayer(layer) {
      let posX = 16 * layer
      Vue.set(this.selectedTexture, layer, -1)
      $('#textureModel').draw({ fn: ctx => {
        ctx.clearRect(posX, 0, 16, 64)
      } })
      this.updateCube()
    }
    
  },
  
  mounted() {
    let vm = this
    
    this.drawTexture(0, this.selectedTexture[0], false)
    this.drawTexture(1, this.selectedTexture[1], false)
    this.drawTexture(2, this.selectedTexture[2], true)
    
    this.$nextTick(function() {
      this.colors.map(function(e, i) {
        $(`.color-input.layer-${i + 1}`)
          .spectrum('set', `rgb ${e.join(',')}`)
          .on('move.spectrum', (_, color) => {
            Vue.set(App.colors, i, [
              Math.floor(color._r),
              Math.floor(color._g),
              Math.floor(color._b)
            ])
            vm.colorFilter(i)
          })
        
        $(`.color-picker.layer-${i + 1}`)
          .on('click', function() {
            $(`.color-input.layer-${i + 1}`).spectrum('show')
            return false
          })
        
        return e
      })
    })
    
  }
  
})



$('.color-input').spectrum({
  //color: '#FFF',
  showInput: false,
  showInitial: true,
  showPalette: true,
  preferredFormat: "rgb",
  palette: ['f44336', 'e91e63', '9c27b0', '3f51b5', '03a9f4', '009688', '4caf50', 'cddc39', 'ff9800',  '795548', '000', 'FFF'],
  maxSelectionSize: 8,
  chooseText: "Ok",
  cancelText: "Cancel"
})