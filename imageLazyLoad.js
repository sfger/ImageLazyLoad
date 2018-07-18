function ImageLazyLoad( options ) {
  return new ImageLazyLoad.prototype.constructor( options );
}
ImageLazyLoad.prototype = {
  slice: Array.prototype.slice,
  toString: Object.prototype.toString,
  hasOwnProperty: Object.prototype.hasOwnProperty,
  isPlainObject: function ( obj ) {
    if ( this.getType( obj ) !== "Object" || obj.nodeType ) return false;
    try {
      if ( obj.constructor && !this.hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) return false;
    } catch ( e ) {
      return false;
    }
    return true;
  },
  getType: function ( obj ) {
    return this.toString.call( obj ).slice( 8, -1 );
  },
  isFunction: function ( obj ) {
    return this.getType( obj ) === "Function";
  },
  isArray: Array.isArray || function ( obj ) {
    return this.type( obj ) === "Array";
  },
  extend: function () {
    var src, copyIsArray, copy, name, options, clone;
    var target = arguments[ 0 ] || {},
      i = 1,
      length = arguments.length,
      deep = false;
    if ( typeof target === "boolean" ) {
      deep = target;
      target = arguments[ i ] || {};
      i++;
    }
    if ( typeof target !== "object" && !this.isFunction( target ) ) {
      target = {};
    }
    if ( i === length ) {
      target = this;
      i--;
    }
    for ( ; i < length; i++ ) {
      if ( ( options = arguments[ i ] ) != null ) {
        for ( name in options ) {
          src = target[ name ];
          copy = options[ name ];
          if ( target === copy ) {
            continue;
          }
          if ( deep && copy && ( this.isPlainObject( copy ) || ( copyIsArray = this.isArray( copy ) ) ) ) {
            if ( copyIsArray ) {
              copyIsArray = false;
              clone = src && this.isArray( src ) ? src : [];
            } else {
              clone = src && this.isPlainObject( src ) ? src : {};
            }
            target[ name ] = this.extend( deep, clone, copy );
          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }
    return target;
  },
  defaultOptions: {
    obserOptions: {
      root: null,
      rootMargin: "200px",
      threshold: [ 0 ],
    }
  },
  observer: null,
  // onImageLoad: function ( target ) {},
  _load: function ( target ) {
    target.style.transition = 'opacity 0.185s ease-in';
    target.style.opacity = '1';
    target.removeEventListener( 'load', this._load );
    this.onImageLoad && this.onImageLoad( target );
  },
  loadImages: function ( images ) {
    for ( var i = 0, len = images.length; i < len; i++ ) {
      this.loadImageItem( images[ i ] );
    }
    return this;
  },
  loadImageItem: function ( target ) {
    var src = target.getAttribute( 'data-src' );
    var srcset = target.getAttribute( 'data-srcset' );
    target.style.opacity = '0';
    if ( src ) target.src = src;
    if ( srcset ) target.srcset = srcset;
    var _this = this;
    target.addEventListener( 'load', function () {
      _this._load( target );
    } );
    this.observer.unobserve( target );
    return this;
  },
  createObserver: function () {
    var _this = this;
    this.observer = new IntersectionObserver( function ( entries ) {
      entries.forEach( function ( entry ) {
        if ( entry.isIntersecting ) {
          var target = entry.target;
          switch ( target.nodeName ) {
            case 'IMG':
              _this.loadImageItem( target );
              break;
            default:
              break;
          }
        }
      } );
    }, this.options.obserOptions );
    return this;
  },
  addImagesBySelector: function ( selector ) {
    this.addImages( document.querySelectorAll( selector ) );
    return this;
  },
  addImages: function ( images ) {
    var len = images.length;
    for ( var i = 0; i < len; i++ ) this.observer.observe( images[ i ] );
    return this;
  },
  constructor: function ( options ) {
    this.options = this.extend( true, {}, this.defaultOptions, options );
    this.createObserver( this.options );
    return this;
  },
};
ImageLazyLoad.prototype.constructor.prototype = ImageLazyLoad.prototype;
