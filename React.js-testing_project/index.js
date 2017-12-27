import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios' //JSON processing

function cl(s){console.log(s)}

class CitysMenu extends React.Component{
 constructor(props){
    super(props);
    this.state = {
      filterText: ''
   }
    this.handleUserInput=this.handleUserInput.bind(this);
  }
  handleUserInput(filterText) {
    this.setState({filterText: filterText});
  }
  render() {
    var funct=this.props.CityMenyFunction;
    return (
      <div>
      <div className='SLFirst'>
        <SearchBar
          filterText={this.state.filterText}
          onUserInput={this.handleUserInput}
        /><div className='MenuTable Center'>
        <CreateButtons
          source={this.props.citys}
          filterText={this.state.filterText}
          funct={funct}
          classes='button_green'
        /></div>
      </div>
      <div className='blocker'>

      </div>
    </div>
    );
  }
};

class SearchBar extends React.Component{
  constructor(props){
    super(props);
    this.handleChange=this.handleChange.bind(this)
  }
  handleChange() {
    this.props.onUserInput(
      this.refs.filterTextInput.value
    );
  }
  render() {
    return (
      <form className='Center'>
        <input
          type="text"
          placeholder="Search..."
          className="SLSearch"
          pattern="[A-Za-zА-Яа-я]+"
          value={this.props.filterText}
          ref="filterTextInput"
          onChange={this.handleChange}
        />
        <h2 className='MenuLabel Center'>Select City</h2>
      </form>
    );
  }
};

class CreateButtons extends React.Component{  // All buttons in the project are created by one component
  render() {
    var rows = [];
    this.props.source.forEach(function(source) {
      if (this.props.filterText != null){
        if ((source.name.toString().toLowerCase().indexOf(this.props.filterText.toString().toLowerCase()) === -1 ) && (1) ) {
        return;}}
      rows.push(<TheButton source={source} key={source.name} funct={this.props.funct} oid={rows.length} classes={this.props.classes}/>);
    }.bind(this));
    return(<div>{rows}</div>);
  }
};

class TheButton extends React.Component{
  render() {
    var name = this.props.source.name;
    var selector;
    var elem;
     var id;
    var oid=this.props.oid;
    (document.getElementById('Selector')) ? selector=document.getElementById('Selector'): selector={selected:null};
    if(selector.innerHTML===name){id='menubuttonselected'} else if(name === 'Вся продукция'){id='categbuttonselected'}
    if (id !== undefined){
      elem=<button className={this.props.classes+' selected'} id={id} data-oid={oid} onClick={this.props.funct}>{name}</button>;
    }
     else{
     elem=<button className={this.props.classes} data-oid={oid} onClick={this.props.funct}>{name}</button>;
  }
    return (
      <div>
        {elem}
      </div>
    )
}};


class LeftPanel extends React.Component{ // The list of shops
    constructor(props){
      super(props);
      this.showmenu=this.showmenu.bind(this)
    }
showmenu(){
    document.getElementsByClassName('SLFirst')[0].classList.remove('hidden');
    document.getElementsByClassName('blocker')[0].classList.remove('hidden');
}
  render() {
    var funct=this.props.LeftPanelFunction;
    return (
      <div id='LeftPanel' className='LeftPanel'>
        <div className='PanelHeader Center InLineParent'>
        <div className='InLineChild'>  <h2 id='Selector' ref={()=>{this.selected=null;this.shopselected=null;this.category=null}} className='MenuLabel'>City</h2></div>
        <div className='InLineChild r'>  <button className='Content_Extend menu' onClick={ ()=> this.showmenu()}>Sel</button></div>
        </div>
        <div className='PanelContent Center'>
          <CreateButtons
            source={this.props.shops}
            filterText={null}
            funct={funct}
            classes='button_green'
          />
        </div>
      </div>
    );
  }
};


class Table extends React.Component{ // Table wwith Products
  render() {
    var rows = [];
    this.props.source.forEach(function(source) {
     rows.push(
     <TheRow source={source} key={source.id}/>
     );});
    return(
    <tbody className='ProductsTable'>
      {rows}</tbody>
    );
  }
};

class TheRow extends React.Component{
  constructor(props) {
    super(props);
this.compareproducts=this.compareproducts.bind(this);
}
compareproducts(id){ // Comparing selected products
    var elem;
    var min;
    elem=document.getElementById('check_'+id).checked; //Processing the selected element
    if (elem===true){document.getElementById('price_'+id).classList.add('TablePriseTd')}
    else{document.getElementById('price_'+id).className='';
    };
    elem=document.getElementsByClassName('TablePriseTd'); //Processing all elements that are selected
    if (elem.length>1){
      min=elem[0];
      for(var i=1;i<elem.length;i++){
        if (parseFloat(min.innerHTML)>parseFloat(elem[i].innerHTML)){
          for(var ii=0;ii<elem.length-1;ii++){
          elem[ii].className='TablePriseTd loose';}
          min=elem[i];
        }
        else if (parseFloat(min.innerHTML)===parseFloat(elem[i].innerHTML)){
          min.className='TablePriseTd won';
          min=elem[i];
        }
        else {elem[i].className='TablePriseTd loose'}
      }
    min.className='TablePriseTd won';
    }
    if (elem.length===1){elem[0].className='TablePriseTd'}
    }
  render() {
    var name = this.props.source.name;
    var id = this.props.source.id;
    var price = this.props.source.price;
    return (
    <tr>
     <td className='tCheck'><input type='checkbox' id={'check_'+id} data-store={price} onClick={ ()=> this.compareproducts(id)}></input></td><td>{name}</td><td className='tPrice' id={'price_'+id}>{price/100} руб</td>
    </tr>
    )
}};


class Page extends React.Component{ // Main class <- to be changed by developers: all functions, DB requests etc, can be stored on separate file.
  constructor(props) {
    super(props);
    this.state = {
      CitysList: [],
      ShopsList:[],
      Category:[],
      store:[]
    }
    this.updateTable=this.updateTable.bind(this);
    this.LeftPanelFunction=this.LeftPanelFunction.bind(this);
    this.CategoryButtonFunction=this.CategoryButtonFunction.bind(this);
    this.CityMenyFunction=this.CityMenyFunction.bind(this);
    this.ContentAction=this.ContentAction.bind(this);
    
  }
  componentDidMount(){  //Loading the Data from the DB (Citys, Shops)
    var _this=this;
    axios.get("http://localhost:3001/db")
     .then(function(response) { 
       _this.setState({   
       CitysList: response.data.CitysList,
       ShopsList: response.data.ShopsList,
       Category: response.data.Category
      });
     })
        .catch(function (error) {
        cl("ERROR ",error);
        })
  }
CityMenyFunction(elem){ // Function for City Menu
    elem=elem.target;
    var selector=document.getElementById('Selector');
    if (document.getElementById('menubuttonselected')!=null) {selector.selected=document.getElementById('menubuttonselected');selector.selected.removeAttribute("id")};
    if (selector.selected!=null) {selector.selected.className='button_green'};
    elem.className='button_green selected';
    selector.innerHTML=elem.textContent;
    selector.selected=elem;
    document.getElementsByClassName('SLFirst')[0].classList.add('hidden');
    document.getElementsByClassName('blocker')[0].classList.add('hidden');
    this.updateTable(elem);
}
LeftPanelFunction(elem){ // Function for Shop Menu
    elem=elem.target;
    var selector=document.getElementById('Selector');
    if (selector.shopselected!=null) {selector.shopselected.className='button_green'};
    elem.className='button_green selected';
    selector.shopselected=elem;
    this.updateTable(elem);
}
CategoryButtonFunction(elem){ // Function for Category Filters
    elem=elem.target;
    var selector=document.getElementById('Selector');
    if (document.getElementById('categbuttonselected')!=null) {selector.category=document.getElementById('categbuttonselected');selector.category.removeAttribute("id")};
    if (selector.category!=null) {selector.category.className='InLineChild button_MC'};
    elem.className='InLineChild button_MC selected';
    selector.category=elem;
    this.updateTable(elem);
}
updateTable(elem){  // Updating the Table
    //elem.preventDefault()
    var _this=this;
    var city='';
    var shop='';
    var items=[];
    var selector=document.getElementById('Selector');
    if (selector.selected!==undefined){city=selector.selected.getAttribute('data-oid')};
    if (selector.shopselected!==undefined){shop=selector.shopselected.getAttribute('data-oid')};
    var cate;
    if (city!=='' && shop!==''){
    var request='http://localhost:3001/Products?'; //Genereting request with selected parameters (City, Shop, Category)
    (selector.category!==undefined)? cate=selector.category.getAttribute('data-oid') : cate=document.getElementById('categbuttonselected').getAttribute('data-oid');
    (cate==='0')?cate='':cate='&category='+cate;
    request+='city='+city+'&shop='+shop+cate;
    axios.get(request)
    .then(function(response) { 
    items=response.data;
    for (var i=0;i<items.length;i++){
     _this.setState({store:items});
     }
    })
    .catch(function (error) {cl("Server Error: ",error);})

}}

  ContentAction(){
  var elements=[
  document.getElementById('LeftPanel'),
  document.getElementById('Content'),
  document.getElementById('Content_Extend')
  ];
  if (elements[0].classList.contains('mini')) {elements.forEach(function(item){item.classList.remove('mini')});}
  else {elements.forEach(function(item){item.classList.add('mini')})};
}
  render() {
    return (
      <div className='container'>
        <CitysMenu citys={this.state.CitysList} CityMenyFunction={this.CityMenyFunction}/>
        <LeftPanel shops={this.state.ShopsList} LeftPanelFunction={this.LeftPanelFunction}/>
        <div id='Content' className='Content'>
        <div className='PanelHeader Center InLineParent'>
          <div className='InLineChild l'>  <button id='Content_Extend' className='Content_Extend' onClick={ ()=> this.ContentAction()}></button></div>
          <div className='InLineChild'> <h3 className='MenuLabel'>Description</h3> </div>
        </div>
        <div className='PanelHeader MainContent InLineParent'>
          <CreateButtons
            source={this.state.Category}
            filterText={null}
            funct={this.CategoryButtonFunction}
            classes='InLineChild button_MC'
          />
        </div>
        <table><thead><tr>
          <th className="tCheck"></th>
          <th>Name</th>
          <th className="tPrice">Price</th></tr></thead></table>
        <div className='ProductsPage'><table>
        <Table source={this.state.store}/>
        </table></div>
      </div>
      </div>
    );}};


ReactDOM.render(
  <Page />, document.getElementById('root')
);
