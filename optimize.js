var OMath={};


OMath.sqrt=function(x)
{
  var xhalf = 0.5*x;
  var ux=x,ui=0x5f3759df - (ui>>1);
  return x*ux*(1.5-xhalf*ux*ux);
}   

alert(OMath.sqrt(4));