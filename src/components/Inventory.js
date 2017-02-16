import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';
class Inventory extends React.Component {

  constructor(){
    super();
    this.renderInvetory = this.renderInvetory.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.logout = this.logout.bind(this);

    this.state = {
      uid: null,
      owner: null,
    }
  }

  componentDidMount(){
    base.onAuth((user) => {
        if(user){
          this.authHandler(null,{ user });
        }
      }
    );
  }

  handleChange(e,key){
    const fish= this.props.fishes[key];
    // take a copy of that fish and update with the new data
    const updateFish={
      ...fish,
      [e.target.name]:[e.target.value]
    }
    this.props.updateFish(key, updateFish);
  }

  authenticate(provider){
    console.log(`intenta iniciar sesion${provider}`);
    base.authWithOAuthPopup(provider, this.authHandler);
  }

  authHandler(err, authData){
    console.log(authData);
    if(err){
      console.log(err);
      return;
    }
    //grabar la info de store
    const storeRef = base.database().ref(this.props.storeId);
    // consulta al firebase para por datos del storeId
    storeRef.once('value', (snapshot) => {
      const data = snapshot.val() || {};
      // rellamar como nuestro si no es nuestro aun
      if(!data.owner) {
        storeRef.set({
          owner: authData.user.uid
        });
      }

      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      });

    });
  }

  logout() {
    base.unauth();
    this.setState({ uid: null });
  }

  renderLogin(){
    return(
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's Inventory</p>
        <button className="github" onClick={()=> this.authenticate('github')}> Log In with GitHub</button>
        <button className="facebook" onClick={()=> this.authenticate('facebook')}> Log In with GitHub</button>
      </nav>
    )
  }

  renderInvetory(key){

    const fish= this.props.fishes[key];

    return (
      <div className="fish-edit" key={key}>
        <input type="text" name="name"  value={fish.name} placeholder="Fish name" onChange={(e) => this.handleChange(e,key)}></input>
        <input type="text" name="price"  value={fish.price} placeholder="Fish price" onChange={(e) => this.handleChange(e,key)}></input>

        <select type="text" name="status"  value={fish.status} placeholder="Fish status" onChange={(e) => this.handleChange(e,key)}>
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>

        <textarea type="text" name="desc" value={fish.desc}  placeholder="Fish desc" onChange={(e) => this.handleChange(e,key)}></textarea>
        <input type="text" name="image" value={fish.image}  placeholder="Fish image" onChange={(e) => this.handleChange(e,key)}></input>
        <button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
      </div>
    )

  };

  render() {
    const logout = <button onClick={this.logout}>Log Out!</button>
    //check si ellos no estan logeados del todo
    if(!this.state.uid) {
      return <div>{this.renderLogin()}</div>
    }
    // check si ellos son los propietarios de la tienda
    if(this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry you aren't the owner of this store!</p>
          {logout}
        </div>
      )
    }

    return (
      <div>
        <h2>Inventory</h2>
        {logout}
          {Object.keys(this.props.fishes).map(this.renderInvetory)}
        <AddFishForm addFish={this.props.addFish}/>
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    )
  }
}

Inventory.propTypes ={
  fishes: React.PropTypes.object.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  storeId: React.PropTypes.string.isRequired
}

export default Inventory;
